import type { LucideIcon } from 'lucide-react'
import { ShoppingBag, Package, Plane, MapPin, CheckCircle, Info, XCircle } from 'lucide-react'
import type { OrderStatus } from '@/lib/queries/orders'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Preparando pedido',
  SHIPPED: 'Despachado desde origen',
  ARRIVED_COUNTRY: 'Llegó al país',
  CUSTOMS: 'Proceso aduanero',
  NATIONAL_DISTRIBUTION: 'Distribución nacional',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  PENDING_TRANSFER: 'Pago por transferencia',
}

export const STATUS_TO_STAGE: Record<OrderStatus, number> = {
  PENDING: 0,
  PENDING_TRANSFER: 0,
  CONFIRMED: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  ARRIVED_COUNTRY: 2,
  CUSTOMS: 2,
  NATIONAL_DISTRIBUTION: 3,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
}

export const STAGE_CONFIG: { label: string; icon: LucideIcon }[] = [
  { label: 'Pedido realizado', icon: ShoppingBag },
  { label: 'En preparación', icon: Package },
  { label: 'Envío internacional', icon: Plane },
  { label: 'Distribución local', icon: MapPin },
  { label: 'Entregado', icon: CheckCircle },
]

export const SUBSTATUS_OPTIONS: Record<OrderStatus, string[]> = {
  PENDING: ['Esperando pago', 'Pago en verificación'],
  CONFIRMED: ['Pago aprobado', 'Pedido confirmado'],
  PROCESSING: ['Preparando pedido', 'Empaquetando producto', 'Etiqueta generada'],
  SHIPPED: [
    'Recibido por el proveedor logístico',
    'En camino al aeropuerto de origen',
    'Llegó al aeropuerto de origen',
    'En vuelo hacia Argentina',
  ],
  ARRIVED_COUNTRY: [
    'Llegó a Argentina',
    'En el depósito del aeropuerto de Ezeiza',
    'Esperando ingreso a Aduana',
  ],
  CUSTOMS: [
    'Ingresó a aduana',
    'En revisión por Aduana Argentina',
    'Despacho en proceso',
    'Liberado por aduana',
  ],
  NATIONAL_DISTRIBUTION: [
    'Entregado a la mensajería local',
    'Ordenando en depósito local',
    'En camino a tu ciudad',
    'Llegó a la sucursal local',
  ],
  OUT_FOR_DELIVERY: [
    'En reparto',
    'Intento de entrega',
    'Reprogramación de entrega',
    'Disponible para retiro',
  ],
  DELIVERED: ['Entregado al destinatario', 'Pedido finalizado'],
  CANCELLED: [],
  PENDING_TRANSFER: ['Esperando confirmación de transferencia'],
}

export const STATUS_ALERT: Record<OrderStatus, string> = {
  PENDING: 'Tu pedido está esperando confirmación de pago.',
  CONFIRMED: 'Tu pago fue aprobado. Estamos preparando tu pedido.',
  PROCESSING: 'Estamos preparando tu pedido con cuidado.',
  SHIPPED: 'Tu pedido está en camino desde el país de origen. Este proceso tarda entre 7 y 10 días.',
  ARRIVED_COUNTRY: 'Tu pedido llegó al país. Próximamente ingresará a proceso aduanero.',
  CUSTOMS: 'Tu pedido está en proceso aduanero. Este proceso puede tardar entre 6 y 14 días hábiles.',
  NATIONAL_DISTRIBUTION: 'Tu pedido fue liberado por aduana y está en distribución nacional.',
  OUT_FOR_DELIVERY: 'Tu pedido está en reparto. Recibirás tu paquete hoy o en las próximas horas.',
  DELIVERED: '¡Tu pedido fue entregado! Gracias por tu compra.',
  CANCELLED: 'Tu pedido fue cancelado. Si tenés dudas, contactanos.',
  PENDING_TRANSFER: 'Estamos verificando tu transferencia. Una vez confirmada, procesaremos tu pedido.',
}

export { Info, XCircle }
