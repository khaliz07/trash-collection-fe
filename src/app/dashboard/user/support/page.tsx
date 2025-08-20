"use client";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImageGallery } from "@/components/ui/image-gallery";
import { Star, Loader2, MessageSquare } from "lucide-react";
import {
  useFAQs,
  useSupportRequests,
  useCreateSupportRequest,
  useCreateSupportFeedback,
} from "@/hooks/use-support";
import type { SupportRequestType } from "@/types/support";
import { toast } from "sonner";

export default function UserSupportPage() {
  const [tab, setTab] = React.useState("faq");
  const [faqSearch, setFaqSearch] = React.useState("");
  const [faqCategory, setFaqCategory] = React.useState<string>("all");
  const [newDialogOpen, setNewDialogOpen] = React.useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = React.useState(false);
  const [feedbackTarget, setFeedbackTarget] = React.useState<string | null>(
    null
  );
  const [feedbackStars, setFeedbackStars] = React.useState(5);
  const [feedbackComment, setFeedbackComment] = React.useState("");
  const [newType, setNewType] = React.useState<SupportRequestType>("PAYMENT");
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newImages, setNewImages] = React.useState<string[]>([]);
  const [feedbackImages, setFeedbackImages] = React.useState<string[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<any>(null);

  // API calls
  const { data: faqData, isLoading: faqLoading } = useFAQs({
    category: faqCategory === "all" ? undefined : faqCategory,
    search: faqSearch || undefined,
  });
  const { data: requestsData, isLoading: requestsLoading } =
    useSupportRequests();
  const createRequestMutation = useCreateSupportRequest();
  const createFeedbackMutation = useCreateSupportFeedback(feedbackTarget || "");

  const categoryMap: Record<string, string> = {
    PAYMENT: "Thanh toán",
    SCHEDULE: "Lịch thu gom",
    ACCOUNT: "Tài khoản",
    TECHNICAL_ISSUE: "Lỗi kỹ thuật",
    OTHER: "Khác",
  };

  const statusMap: Record<string, string> = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang xử lý",
    RESOLVED: "Đã giải quyết",
    REJECTED: "Từ chối",
  };

  function getStatusVariant(status: string) {
    switch (status) {
      case "PENDING":
        return "warning" as const;
      case "IN_PROGRESS":
        return "info" as const;
      case "RESOLVED":
        return "success" as const;
      case "REJECTED":
        return "error" as const;
      default:
        return "default" as const;
    }
  }

  // Gửi yêu cầu mới
  function handleSendRequest() {
    if (!newTitle.trim() || !newDesc.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    createRequestMutation.mutate(
      {
        type: newType,
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: "NORMAL",
        images: newImages,
      },
      {
        onSuccess: () => {
          toast.success("Gửi yêu cầu hỗ trợ thành công");
          setNewDialogOpen(false);
          setNewTitle("");
          setNewDesc("");
          setNewType("PAYMENT");
          setNewImages([]);
        },
        onError: (error: any) => {
          toast.error(error.message || "Có lỗi xảy ra khi gửi yêu cầu");
        },
      }
    );
  }

  // Gửi feedback hỗ trợ
  function handleSendFeedback() {
    if (!feedbackTarget) return;

    createFeedbackMutation.mutate(
      {
        rating: feedbackStars,
        comment: feedbackComment.trim() || undefined,
        images: feedbackImages,
      },
      {
        onSuccess: () => {
          toast.success("Cảm ơn bạn đã đánh giá!");
          setFeedbackDialogOpen(false);
          setFeedbackTarget(null);
          setFeedbackStars(5);
          setFeedbackComment("");
          setFeedbackImages([]);
        },
        onError: (error: any) => {
          toast.error(error.message || "Có lỗi xảy ra khi gửi đánh giá");
        },
      }
    );
  }

  // Mở dialog feedback
  function openFeedbackDialog(id: string) {
    setFeedbackTarget(id);
    setFeedbackDialogOpen(true);
    setFeedbackStars(5);
    setFeedbackComment("");
  }

  // Mở dialog xem chi tiết
  function openDetailDialog(request: any) {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  }

  const faqs = faqData?.data || [];
  const requests = requestsData?.data || [];

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Hỗ trợ và khiếu nại
      </h1>
      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="faq">Câu hỏi thường gặp</TabsTrigger>
          <TabsTrigger value="requests">Yêu cầu đã gửi</TabsTrigger>
        </TabsList>
        <TabsContent value="faq">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tìm kiếm thông tin hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Input
                  placeholder="Tìm kiếm..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="md:w-1/2"
                />
                <Select value={faqCategory} onValueChange={setFaqCategory}>
                  <SelectTrigger className="md:w-1/3">
                    <SelectValue placeholder="Chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.entries(categoryMap).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {faqLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Accordion type="multiple" className="mb-4">
                  {faqs.map((faq: any) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                  {faqs.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Không tìm thấy câu hỏi nào
                    </div>
                  )}
                </Accordion>
              )}

              <Button
                variant="secondary"
                onClick={() => setNewDialogOpen(true)}
              >
                Gửi yêu cầu hỗ trợ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đã gửi</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Ngày gửi</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req: any) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          {categoryMap[req.type] || req.type}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{req.title}</span>
                            {req.images && req.images.length > 0 && (
                              <Badge variant="default" className="text-xs">
                                {req.images.length} ảnh
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(req.status)}>
                            {statusMap[req.status] || req.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {req.status === "RESOLVED" ? (
                            req.feedback ? (
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    className={
                                      n <= req.feedback.rating
                                        ? "text-yellow-400 fill-yellow-400 w-4 h-4"
                                        : "text-gray-300 w-4 h-4"
                                    }
                                  />
                                ))}
                                {req.feedback.comment && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {req.feedback.comment}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Chưa đánh giá
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetailDialog(req)}
                            >
                              Xem chi tiết
                            </Button>
                            {req.status === "RESOLVED" && !req.feedback && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => openFeedbackDialog(req.id)}
                              >
                                Đánh giá
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {requests.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          Chưa có yêu cầu hỗ trợ nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog gửi yêu cầu mới */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gửi yêu cầu hỗ trợ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Loại yêu cầu</label>
              <Select
                value={newType}
                onValueChange={(v) => setNewType(v as SupportRequestType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại yêu cầu" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryMap).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                placeholder="Nhập tiêu đề..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả chi tiết</label>
              <Textarea
                placeholder="Mô tả chi tiết vấn đề của bạn..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ảnh đính kèm (tùy chọn)
              </label>
              <ImageUpload
                images={newImages}
                onImagesChange={setNewImages}
                maxImages={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSendRequest}
              disabled={
                !newTitle.trim() ||
                !newDesc.trim() ||
                createRequestMutation.isPending
              }
            >
              {createRequestMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog đánh giá hỗ trợ */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá hỗ trợ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Mức độ hài lòng
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFeedbackStars(n)}
                  >
                    <Star
                      className={
                        n <= feedbackStars
                          ? "text-yellow-400 fill-yellow-400 w-8 h-8"
                          : "text-gray-300 w-8 h-8"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nhận xét (tùy chọn)</label>
              <Textarea
                className="w-full border rounded p-2 text-sm"
                rows={3}
                placeholder="Chia sẻ nhận xét của bạn..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ảnh đính kèm (tùy chọn)
              </label>
              <ImageUpload
                images={feedbackImages}
                onImagesChange={setFeedbackImages}
                maxImages={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSendFeedback}
              disabled={feedbackStars < 1 || createFeedbackMutation.isPending}
            >
              {createFeedbackMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết yêu cầu hỗ trợ */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu hỗ trợ</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Loại yêu cầu
                  </label>
                  <p className="text-sm font-medium">
                    {categoryMap[selectedRequest.type] || selectedRequest.type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(selectedRequest.status)}>
                      {statusMap[selectedRequest.status] ||
                        selectedRequest.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Ngày gửi
                  </label>
                  <p className="text-sm">
                    {new Date(selectedRequest.createdAt).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                {selectedRequest.resolvedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ngày giải quyết
                    </label>
                    <p className="text-sm">
                      {new Date(selectedRequest.resolvedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Nội dung yêu cầu */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tiêu đề
                </label>
                <p className="text-base font-medium mt-1">
                  {selectedRequest.title}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Mô tả chi tiết
                </label>
                <p className="text-sm mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Ảnh đính kèm từ user */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Ảnh đính kèm ({selectedRequest.images.length})
                  </label>
                  <ImageGallery images={selectedRequest.images} />
                </div>
              )}

              {/* Phản hồi từ Admin */}
              {selectedRequest.adminResponse && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Phản hồi từ Admin
                      </p>
                      {selectedRequest.adminResponseAt && (
                        <p className="text-xs text-blue-600">
                          {new Date(
                            selectedRequest.adminResponseAt
                          ).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap bg-white p-3 rounded border">
                    {selectedRequest.adminResponse}
                  </p>
                </div>
              )}

              {/* Feedback của user */}
              {selectedRequest.feedback && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600 mb-3 block">
                    Đánh giá của bạn
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={
                            n <= selectedRequest.feedback.rating
                              ? "text-yellow-400 fill-yellow-400 w-5 h-5"
                              : "text-gray-300 w-5 h-5"
                          }
                        />
                      ))}
                      <span className="text-sm font-medium ml-2">
                        {selectedRequest.feedback.rating}/5 sao
                      </span>
                    </div>
                    {selectedRequest.feedback.comment && (
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                        {selectedRequest.feedback.comment}
                      </p>
                    )}
                    {/* Ảnh từ feedback */}
                    {selectedRequest.feedback.images &&
                      selectedRequest.feedback.images.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">
                            Ảnh đính kèm trong đánh giá (
                            {selectedRequest.feedback.images.length})
                          </p>
                          <ImageGallery
                            images={selectedRequest.feedback.images}
                          />
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Nút đánh giá nếu chưa có feedback */}
              {selectedRequest.status === "RESOLVED" &&
                !selectedRequest.feedback && (
                  <div className="text-center">
                    <Button
                      onClick={() => {
                        setDetailDialogOpen(false);
                        openFeedbackDialog(selectedRequest.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Đánh giá hỗ trợ này
                    </Button>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
