-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "client_id" VARCHAR(20) NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "street" VARCHAR(255),
    "city" VARCHAR(255),
    "state" VARCHAR(50),
    "zip" VARCHAR(20),
    "payment_schedule" VARCHAR(20) NOT NULL,
    "payment_terms" VARCHAR(20) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "total_spent" DECIMAL(10,2) DEFAULT 0,
    "last_payment" DATE,
    "upcoming_payment" DATE,
    "joined_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "tax_rate" DECIMAL(5,2) DEFAULT 0,
    "status" VARCHAR(20) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "sku" VARCHAR(100),
    "stock_quantity" INTEGER DEFAULT 0,
    "is_featured" BOOLEAN DEFAULT false,
    "is_new" BOOLEAN DEFAULT false,
    "sale_price" DECIMAL(10,2),
    "weight" DECIMAL(10,2),
    "dimensions_json" JSONB,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "slug" VARCHAR(255),
    "service_work_hours" INTEGER DEFAULT 0,
    "work_hour_by_day" VARCHAR(255),
    "work_hours_per_day" DECIMAL(5,2),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "address_street" VARCHAR(255),
    "address_city" VARCHAR(100),
    "address_state" VARCHAR(100),
    "address_zip" VARCHAR(20),
    "address_country" VARCHAR(100),
    "position" VARCHAR(255) NOT NULL,
    "department" VARCHAR(100),
    "join_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "avatar" VARCHAR(255),
    "role" VARCHAR(50) NOT NULL DEFAULT 'support',
    "payment_rate" DECIMAL(10,2) NOT NULL,
    "salary" DECIMAL(10,2),
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "payment_frequency" VARCHAR(255) DEFAULT 'hourly',
    "payment_type" VARCHAR(50) DEFAULT 'hourly',
    "payment_duration" VARCHAR(50) DEFAULT 'hourly',
    "payment_time" VARCHAR(255) DEFAULT 'daily',

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "client_id" INTEGER,
    "staff_id" INTEGER,
    "isfirstlogin" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_clients_created_by" ON "clients"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "idx_product_category" ON "products"("category");

-- CreateIndex
CREATE INDEX "idx_product_status" ON "products"("status");

-- CreateIndex
CREATE INDEX "idx_products_category" ON "products"("category");

-- CreateIndex
CREATE INDEX "idx_products_created_by" ON "products"("created_by");

-- CreateIndex
CREATE INDEX "idx_products_status" ON "products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
