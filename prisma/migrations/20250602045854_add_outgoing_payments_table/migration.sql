-- CreateTable
CREATE TABLE "expense_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outgoing_payments" (
    "id" SERIAL NOT NULL,
    "payment_number" VARCHAR(50) NOT NULL,
    "payment_category" VARCHAR(100) NOT NULL,
    "expense_category_id" INTEGER,
    "staff_id" INTEGER,
    "product_id" INTEGER,
    "payee_name" VARCHAR(255),
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL,
    "reference_number" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "attachments" JSONB,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outgoing_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_expense_categories_status" ON "expense_categories"("status");

-- CreateIndex
CREATE UNIQUE INDEX "outgoing_payments_payment_number_key" ON "outgoing_payments"("payment_number");

-- CreateIndex
CREATE INDEX "idx_outgoing_payments_category" ON "outgoing_payments"("payment_category");

-- CreateIndex
CREATE INDEX "idx_outgoing_payments_status" ON "outgoing_payments"("status");

-- CreateIndex
CREATE INDEX "idx_outgoing_payments_created_by" ON "outgoing_payments"("created_by");

-- CreateIndex
CREATE INDEX "idx_outgoing_payments_number" ON "outgoing_payments"("payment_number");

-- CreateIndex
CREATE INDEX "idx_outgoing_payments_expense_category" ON "outgoing_payments"("expense_category_id");

-- CreateIndex
CREATE INDEX "idx_outgoing_payments_staff" ON "outgoing_payments"("staff_id");

-- CreateIndex
CREATE INDEX "idx_outgoing_payments_product" ON "outgoing_payments"("product_id");

-- AddForeignKey
ALTER TABLE "outgoing_payments" ADD CONSTRAINT "outgoing_payments_expense_category_id_fkey" FOREIGN KEY ("expense_category_id") REFERENCES "expense_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "outgoing_payments" ADD CONSTRAINT "outgoing_payments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "outgoing_payments" ADD CONSTRAINT "outgoing_payments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "outgoing_payments" ADD CONSTRAINT "outgoing_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
