import type { OrderStatus } from '@/lib/queries/orders'
import {
  Package,
  CheckCircle2,
  Settings2,
  Truck,
  MapPin,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PENDING_TRANSFER: 'Pago por transferencia',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export const STATUS_STEP: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PENDING_TRANSFER: 0,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
  CANCELLED: -1,
}

export const STATUS_ALERT: Record<OrderStatus, string> = {
  PENDING: 'Tu pedido fue registrado. Pronto recibirás confirmación.',
  CONFIRMED: 'Tu pedido fue confirmado. Comenzaremos a prepararlo en breve.',
  PENDING_TRANSFER: 'Estamos verificando tu transferencia. Te avisaremos al confirmar.',
  PROCESSING: 'Tu pedido está siendo preparado. Te notificaremos cuando sea enviado.',
  SHIPPED: 'Tu pedido está en camino. Te avisaremos cuando llegue a tu zona.',
  OUT_FOR_DELIVERY: 'Tu pedido está en reparto. Pronto llegará a tu puerta.',
  DELIVERED: 'Tu pedido fue entregado. ¡Esperamos que lo disfrutes!',
  CANCELLED: 'Tu pedido fue cancelado. Contacta soporte si tienes consultas.',
}

export type TimelineStep = {
  label: string
  icon: LucideIcon
}

export const TIMELINE_STEPS: TimelineStep[] = [
  { label: 'Pedido realizado', icon: Package },
  { label: 'Confirmado', icon: CheckCircle2 },
  { label: 'En proceso', icon: Settings2 },
  { label: 'Enviado', icon: Truck },
  { label: 'En reparto', icon: MapPin },
  { label: 'Entregado', icon: CheckCircle },
]
