# Invoice Bill — บริษัท อนาไฮม์ ดิจิทัล เทค จำกัด

ระบบออกใบแจ้งหนี้ / ใบเสนอราคา / ใบเสร็จรับเงิน สำหรับ **บริษัท อนาไฮม์ ดิจิทัล เทค จำกัด**

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | Mantine v9 + Tabler Icons |
| Language | TypeScript |
| Database | MongoDB (Mongoose) |
| Font | Sarabun (Google Fonts) |
| Package manager | Yarn v4 |

## Features

- สร้าง / แก้ไข / ลบ **ใบเสนอราคา, ใบแจ้งหนี้, ใบเสร็จรับเงิน**
- พิมพ์เอกสาร A4 สไตล์ราชการ (จำนวนเงินตัวอักษรภาษาไทย)
- บุ๊คมาร์คลูกค้า / Auto-fill ข้อมูลลูกค้า
- Quick status change จาก Dashboard
- คัดลอก (Duplicate) เอกสาร
- Export CSV
- หน้ารายงานสรุปยอดรายเดือน + bar chart
- ระบบ Login (Password-based session)

## Project Structure

```
invoice-bill/
├── app/
│   ├── api/
│   │   ├── auth/signin/     # POST — sign-in
│   │   ├── auth/signout/    # POST — sign-out
│   │   ├── invoices/        # GET, POST (list + create/update)
│   │   ├── invoices/[id]/   # GET, PUT, DELETE
│   │   ├── contacts/        # GET, POST
│   │   └── contacts/[id]/   # DELETE
│   ├── invoices/
│   │   ├── new/             # สร้างเอกสารใหม่
│   │   └── [id]/
│   │       ├── page.tsx     # แก้ไขเอกสาร
│   │       └── print/       # พิมพ์เอกสาร
│   ├── reports/             # หน้ารายงาน
│   ├── signin/              # หน้า Login
│   ├── globals.css          # Print media queries
│   ├── layout.tsx           # Root layout (MantineProvider)
│   └── page.tsx             # Dashboard
├── components/
│   ├── AppHeader.tsx        # Sticky header (ใช้ซ้ำทุกหน้า)
│   ├── ContactPickerModal.tsx  # Modal เลือก/ลบลูกค้า
│   ├── InvoiceForm.tsx      # ฟอร์มสร้าง/แก้ไขเอกสาร
│   └── PrintView.tsx        # หน้าพิมพ์ A4
├── lib/
│   ├── constants.ts         # ข้อมูลบริษัท, labels, colors
│   ├── contacts.ts          # API client — contacts
│   ├── db.ts                # Mongoose connection
│   ├── store.ts             # API client — invoices
│   ├── thaiText.ts          # แปลงตัวเลขเป็นอักษรไทย
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # formatMoney, calcTotals, uid, ...
├── models/
│   ├── Contact.ts           # Mongoose schema
│   └── Invoice.ts           # Mongoose schema
├── middleware.ts             # Auth guard (redirect → /signin)
└── .env.local               # MONGODB_URI, APP_PASSWORD
```

## Getting Started

```bash
# Install dependencies
yarn install

# Set environment variables
cp .env.local.example .env.local   # แก้ไข MONGODB_URI และ APP_PASSWORD

# Dev server
yarn dev

# Build
yarn build && yarn start
```

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `APP_PASSWORD` | รหัสผ่านสำหรับเข้าสู่ระบบ |
