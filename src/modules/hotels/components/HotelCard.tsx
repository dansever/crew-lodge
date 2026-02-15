import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import type { Hotel } from '@/convex/types';
import { cn } from '@/lib/utils';
import { Button } from '@/stories';
import { useMutation } from 'convex/react';
import { motion } from 'framer-motion';
import {
  BedDouble,
  Building2,
  DollarSign,
  Globe,
  Heart,
  Info,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react';

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
};

function formatAddress(address: Hotel['address']): string {
  const parts = [
    address?.street,
    address?.city,
    address?.state,
    address?.postalCode,
    address?.country,
  ].filter(Boolean);
  return parts.join(', ') || '—';
}

function StatBlock({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2',
        className
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export interface HotelCardProps {
  hotel: Hotel;
  onDetailsClick?: (hotel: Hotel) => void;
}

export function HotelCard({ hotel, onDetailsClick }: HotelCardProps) {
  const updateHotel = useMutation(api.functions.hotels.updateHotel);

  const handleHeartClick = (hotelId: Id<'hotels'>, isPreferred: boolean) => {
    updateHotel({ id: hotelId, hotel: { isPreferred } });
  };

  return (
    <motion.div key={hotel._id} variants={item} initial="hidden" animate="show">
      <Card className="gap-2 pb-2 group overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="flex flex-wrap items-center gap-2 text-lg leading-tight">
                <span className="truncate">{hotel.name}</span>

                {hotel.isActive === false && (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    Inactive
                  </Badge>
                )}
              </CardTitle>
              {hotel.chain && (
                <CardDescription className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {hotel.chain}
                </CardDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleHeartClick(hotel._id, !hotel.isPreferred)}
              className={cn(
                hotel.isPreferred
                  ? 'bg-pink-50 hover:bg-pink-100/60 active:bg-pink-100'
                  : ''
              )}
            >
              <Heart
                color={hotel.isPreferred ? '#f6339a' : '#e5e7eb '}
                fill={hotel.isPreferred ? '#f6339a' : '#e5e7eb '}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex flex-row gap-4">
            {/* Location */}
            <div className="flex items-start gap-1 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="line-clamp-2">
                {formatAddress(hotel.address)}
              </span>
            </div>
            <ContactRow hotel={hotel} />
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <StatBlock
              icon={BedDouble}
              label="YTD nights"
              value={hotel.ytdNights ?? '—'}
            />
            <StatBlock
              icon={DollarSign}
              label="YTD spend"
              value={
                typeof hotel.ytdSpend === 'number'
                  ? `$${hotel.ytdSpend.toLocaleString()}`
                  : '—'
              }
            />
            <StatBlock
              icon={ShieldCheck}
              label="SLA compliance"
              value={
                typeof hotel.slaCompliance === 'number'
                  ? `${hotel.slaCompliance}%`
                  : '—'
              }
            />
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Info}
            text="Details"
            onClick={() => onDetailsClick?.(hotel)}
          />
          <Button variant="primary" size="sm" icon={Send} text="Book Now" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}

const ContactRow = ({ hotel }: { hotel: Hotel }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {hotel.phone && (
        <a
          href={`tel:${hotel.phone}`}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          {hotel.phone || '—'}
        </a>
      )}
      {hotel.email && (
        <a
          href={`mailto:${hotel.email}`}
          className="flex items-center gap-1 truncate hover:text-foreground transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{hotel.email || '—'}</span>
        </a>
      )}
      {hotel.website && (
        <a
          href={
            hotel.website.startsWith('http')
              ? hotel.website
              : `https://${hotel.website}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 truncate hover:text-foreground transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="truncate">Website</span>
        </a>
      )}
    </div>
  );
};
