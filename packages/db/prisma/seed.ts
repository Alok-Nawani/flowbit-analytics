// packages/db/prisma/seed.ts
import { PrismaClient, InvoiceStatus } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// Get __dirname equivalent for both ESM and CommonJS
const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return __dirname;
  }
};

async function main() {
  // Get the project root (3 levels up from prisma/seed.ts: prisma -> db -> packages -> root)
  const seedDir = getDirname();
  const projectRoot = path.resolve(seedDir, "..", "..", "..");
  const file = path.join(projectRoot, "data", "Analytics_Test_Data.json");
  
  if (!fs.existsSync(file)) {
    console.log("No seed data file found. Creating sample data...");
    // Create minimal sample data for testing
    const category = await prisma.category.upsert({
      where: { name: "Logistics" },
      update: {},
      create: { name: "Logistics" },
    });

    const vendor = await prisma.vendor.upsert({
      where: { externalId: "vendor:sample" },
      update: {},
      create: {
        externalId: "vendor:sample",
        name: "Sample Vendor",
        categoryId: category.id,
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-001",
        vendorId: vendor.id,
        invoiceDate: new Date(),
        subtotal: 10000,
        tax: 1800,
        total: 11800,
        status: InvoiceStatus.PENDING,
        lineItems: {
          create: {
            description: "Sample Item",
            quantity: 1,
            unitPrice: 10000,
            total: 10000,
          },
        },
      },
    });

    console.log("Created sample data:", { category: category.name, vendor: vendor.name, invoice: invoice.invoiceNumber });
    return;
  }

  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw);

  // Expecting data.invoices[] with nested vendor, customer, payments, line_items, documents
  const invoices = data.invoices ?? data;
  
  for (const inv of invoices) {
    // Upsert Category
    const category = inv.category ? await prisma.category.upsert({
      where: { name: inv.category },
      update: {},
      create: { name: inv.category },
    }) : null;

    // Upsert Vendor
    const vendorExternalId = inv.vendor?.id ?? inv.vendor_id ?? `vendor:${inv.vendor?.name ?? inv.vendor_name ?? "Unknown"}`;
    const vendor = await prisma.vendor.upsert({
      where: { externalId: vendorExternalId },
      update: {
        name: inv.vendor?.name ?? inv.vendor_name ?? "Unknown Vendor",
        taxId: inv.vendor?.tax_id ?? null,
        email: inv.vendor?.email ?? null,
        phone: inv.vendor?.phone ?? null,
        city: inv.vendor?.city ?? null,
        country: inv.vendor?.country ?? null,
        categoryId: category?.id,
      },
      create: {
        externalId: vendorExternalId,
        name: inv.vendor?.name ?? inv.vendor_name ?? "Unknown Vendor",
        taxId: inv.vendor?.tax_id ?? null,
        email: inv.vendor?.email ?? null,
        phone: inv.vendor?.phone ?? null,
        city: inv.vendor?.city ?? null,
        country: inv.vendor?.country ?? null,
        categoryId: category?.id ?? undefined,
      },
    });

    // Upsert Customer
    const customer = inv.customer ? await prisma.customer.upsert({
      where: { externalId: inv.customer.id ?? inv.customer_id ?? `customer:${inv.customer.name}` },
      update: {
        name: inv.customer.name,
        email: inv.customer.email ?? null,
      },
      create: {
        externalId: inv.customer.id ?? inv.customer_id ?? `customer:${inv.customer.name}`,
        name: inv.customer.name ?? inv.customer_name ?? "Unknown Customer",
        email: inv.customer.email ?? null,
      },
    }) : null;

    // Determine invoice status
    let status: InvoiceStatus = InvoiceStatus.PENDING;
    if (inv.status) {
      const statusUpper = inv.status.toUpperCase();
      if (Object.values(InvoiceStatus).includes(statusUpper as InvoiceStatus)) {
        status = statusUpper as InvoiceStatus;
      }
    }

    // Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        externalId: inv.id ?? null,
        invoiceNumber: inv.invoice_number ?? inv.number ?? `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vendorId: vendor.id,
        customerId: customer?.id,
        categoryId: category?.id,
        invoiceDate: new Date(inv.invoice_date ?? inv.date ?? Date.now()),
        dueDate: inv.due_date ? new Date(inv.due_date) : null,
        status: status,
        currency: inv.currency ?? "INR",
        subtotal: parseFloat(inv.subtotal ?? inv.amount ?? 0),
        tax: parseFloat(inv.tax ?? 0),
        discount: parseFloat(inv.discount ?? 0),
        total: parseFloat(inv.total ?? inv.amount ?? 0),
        paidAmount: parseFloat(inv.paid_amount ?? 0),
        lineItems: {
          create: (inv.line_items ?? inv.items ?? []).map((li: any) => ({
            description: li.description ?? li.name ?? "Item",
            quantity: parseInt(li.quantity ?? 1),
            unitPrice: parseFloat(li.unit_price ?? li.price ?? 0),
            total: parseFloat(li.total ?? (li.quantity ?? 1) * (li.unit_price ?? li.price ?? 0)),
          })),
        },
        payments: {
          create: (inv.payments ?? []).map((p: any) => ({
            paymentDate: new Date(p.date ?? p.payment_date ?? Date.now()),
            amount: parseFloat(p.amount ?? 0),
            method: p.method ?? null,
            reference: p.reference ?? null,
          })),
        },
        documents: {
          create: (inv.documents ?? inv.files ?? []).map((d: any) => ({
            url: d.url,
            kind: d.kind ?? d.type ?? null,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${invoices.length} invoices`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

