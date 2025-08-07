// Mock payment storage (in production, use database)
const paymentStorage = new Map<string, any>()

export interface Payment {
  id: string
  status: 'pending' | 'success' | 'failed'
  amount?: number
  packageName?: string
  duration?: string
  method?: string
  createdAt: string
  updatedAt?: string
  confirmedAt?: string
}

export function getPayment(paymentId: string): Payment | undefined {
  return paymentStorage.get(paymentId)
}

export function createPayment(paymentId: string, paymentData: Partial<Payment>): Payment {
  const payment: Payment = {
    id: paymentId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...paymentData
  }
  
  paymentStorage.set(paymentId, payment)
  return payment
}

export function updatePaymentStatus(
  paymentId: string, 
  status: 'pending' | 'success' | 'failed', 
  additionalData?: any
): Payment {
  const existingPayment = paymentStorage.get(paymentId) || { 
    id: paymentId, 
    status: 'pending',
    createdAt: new Date().toISOString() 
  }
  
  const updatedPayment: Payment = {
    ...existingPayment,
    status,
    updatedAt: new Date().toISOString(),
    ...additionalData
  }
  
  paymentStorage.set(paymentId, updatedPayment)
  return updatedPayment
}

export function getAllPayments(): Payment[] {
  return Array.from(paymentStorage.values())
}

export function deletePayment(paymentId: string): boolean {
  return paymentStorage.delete(paymentId)
}
