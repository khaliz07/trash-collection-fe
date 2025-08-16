"use client";

import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin } from "@/hooks/use-auth-mutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Recycle as Recycling } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values);
  }

  function onError(errors: any) {
    console.log("Form validation errors:", errors);
  }

  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("register.back_to_home", "Quay lại trang chủ")}
            </Link>
          </div>

          <Card className="w-full">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Recycling className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">
                {t("login.heading")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("login.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="credentials" className="mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="credentials">
                    {t("login.credentialsTab")}
                  </TabsTrigger>
                  <TabsTrigger value="otp">{t("login.otpTab")}</TabsTrigger>
                </TabsList>
                <TabsContent value="credentials">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit, onError)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("email")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="example@email.com"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("password")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your password"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="text-sm text-right">
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {t("login.forgotPassword")}
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending
                          ? t("login.signingIn")
                          : t("login.button")}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value="otp">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("login.phoneLabel")}</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                      />
                    </div>
                    <Button className="w-full">{t("login.sendOtp")}</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                {t("login.noAccount")}{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  {t("login.signupLink")}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}
