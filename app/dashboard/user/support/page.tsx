'use client';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { mockFAQ, mockSupportRequests, FAQItem, SupportRequest } from './mockData';

const categoryMap = {
  payment: 'Thanh toán',
  schedule: 'Lịch thu gom',
  account: 'Tài khoản',
  issue: 'Sự cố',
  other: 'Khác',
};

const typeMap = categoryMap;

function getStatusVariant(status: string) {
  switch (status) {
    case 'pending': return 'warning';
    case 'resolved': return 'success';
    case 'rejected': return 'error';
    default: return 'default';
  }
}

export default function UserSupportPage() {
  const [tab, setTab] = React.useState('faq');
  const [faqSearch, setFaqSearch] = React.useState('');
  const [faqCategory, setFaqCategory] = React.useState<string | undefined>();
  const [localFAQ] = React.useState(mockFAQ);
  const [localRequests, setLocalRequests] = React.useState(mockSupportRequests);
  const [newDialogOpen, setNewDialogOpen] = React.useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = React.useState(false);
  const [feedbackTarget, setFeedbackTarget] = React.useState<string | null>(null);
  const [feedbackStars, setFeedbackStars] = React.useState(5);
  const [feedbackComment, setFeedbackComment] = React.useState('');
  const [newType, setNewType] = React.useState<'payment'|'schedule'|'issue'|'account'|'other'>('payment');
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  // const [newImage, setNewImage] = React.useState<File|null>(null); // (optional)

  // Filter FAQ
  const filteredFAQ = localFAQ.filter(faq =>
    (!faqCategory || faq.category === faqCategory) &&
    (faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || faq.answer.toLowerCase().includes(faqSearch.toLowerCase()))
  );

  // Gửi yêu cầu mới
  function handleSendRequest() {
    setLocalRequests(prev => [
      {
        id: 'req' + (prev.length + 1),
        type: newType,
        title: newTitle,
        description: newDesc,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewDialogOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewType('payment');
  }

  // Gửi feedback hỗ trợ
  function handleSendFeedback() {
    setLocalRequests(prev => prev.map(r =>
      r.id === feedbackTarget
        ? {
            ...r,
            feedback: {
              stars: feedbackStars,
              comment: feedbackComment,
              date: new Date().toISOString(),
            },
          }
        : r
    ));
    setFeedbackDialogOpen(false);
    setFeedbackTarget(null);
    setFeedbackStars(5);
    setFeedbackComment('');
  }

  // Mở dialog feedback
  function openFeedbackDialog(id: string) {
    setFeedbackTarget(id);
    setFeedbackDialogOpen(true);
    setFeedbackStars(5);
    setFeedbackComment('');
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Hỗ trợ & Khiếu nại</h1>
      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="requests">Yêu cầu đã gửi</TabsTrigger>
        </TabsList>
        <TabsContent value="faq">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tra cứu thông tin hỗ trợ (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Input placeholder="Tìm kiếm..." value={faqSearch} onChange={e => setFaqSearch(e.target.value)} className="md:w-1/2" />
                <Select value={faqCategory ?? 'all'} onValueChange={v => setFaqCategory(v === 'all' ? undefined : v)}>
                  <SelectTrigger className="md:w-1/3">
                    <SelectValue placeholder="Chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.entries(categoryMap).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Accordion type="multiple" className="mb-4">
                {filteredFAQ.map(faq => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button variant="secondary" onClick={() => setNewDialogOpen(true)}>Gửi yêu cầu hỗ trợ</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đã gửi</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Phản hồi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{typeMap[req.type]}</TableCell>
                      <TableCell>{req.title}</TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(req.status)}>
                          {req.status === 'pending' && 'Đang xử lý'}
                          {req.status === 'resolved' && 'Đã xử lý'}
                          {req.status === 'rejected' && 'Bị từ chối'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {req.status === 'resolved' ? (
                          req.feedback ? (
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(n => (
                                <Star key={n} className={n <= req.feedback!.stars ? 'text-yellow-400 fill-yellow-400 w-4 h-4' : 'text-gray-300 w-4 h-4'} />
                              ))}
                              {req.feedback.comment && (
                                <span className="ml-2 text-xs text-muted-foreground">{req.feedback.comment}</span>
                              )}
                            </div>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => openFeedbackDialog(req.id)}>Đánh giá hỗ trợ</Button>
                          )
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          <div className="mb-2">
            <Select value={newType} onValueChange={v => setNewType(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Loại yêu cầu" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeMap).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input className="mb-2" placeholder="Tiêu đề" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <Textarea className="mb-2" placeholder="Mô tả chi tiết" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} />
          {/* <Input type="file" /> */}
          <DialogFooter>
            <Button onClick={handleSendRequest} disabled={!newTitle || !newDesc}>Gửi yêu cầu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog đánh giá hỗ trợ */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá hỗ trợ</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setFeedbackStars(n)}>
                <Star className={n <= feedbackStars ? 'text-yellow-400 fill-yellow-400 w-6 h-6' : 'text-gray-300 w-6 h-6'} />
              </button>
            ))}
          </div>
          <Textarea className="w-full border rounded p-2 text-sm" rows={3} placeholder="Nhận xét của bạn (không bắt buộc)" value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} />
          <DialogFooter>
            <Button onClick={handleSendFeedback} disabled={feedbackStars < 1}>Gửi đánh giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 