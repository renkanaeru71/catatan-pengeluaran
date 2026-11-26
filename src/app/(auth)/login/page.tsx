import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Masuk — Catatan Pengeluaran",
  description: "Masuk ke aplikasi catatan pengeluaran pribadi.",
};

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Catatan Pengeluaran</CardTitle>
          <CardDescription>
            Masukkan password untuk membuka catatan uang kamu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
