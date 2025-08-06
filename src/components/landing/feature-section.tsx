import {
  BarChart,
  Bell,
  Calendar,
  Clock,
  CreditCard,
  Map,
  Shield,
  Star
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../../i18n'

export function FeatureSection() {
  const { t } = useTranslation()
  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: t('featuresList.smartScheduling.title'),
      description: t('featuresList.smartScheduling.description')
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: t('featuresList.realTimeNotifications.title'),
      description: t('featuresList.realTimeNotifications.description')
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: t('featuresList.flexiblePayments.title'),
      description: t('featuresList.flexiblePayments.description')
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: t('featuresList.urgentPickups.title'),
      description: t('featuresList.urgentPickups.description')
    },
    {
      icon: <Map className="h-6 w-6" />,
      title: t('featuresList.locationTracking.title'),
      description: t('featuresList.locationTracking.description')
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: t('featuresList.collectionAnalytics.title'),
      description: t('featuresList.collectionAnalytics.description')
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('featuresList.verifiedCollections.title'),
      description: t('featuresList.verifiedCollections.description')
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: t('featuresList.rateService.title'),
      description: t('featuresList.rateService.description')
    }
  ]

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/50 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-16">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
            <span className="text-primary mr-1">✨</span>
            <span>{t('featuresList.powerfulFeatures', t('features.powerfulFeatures'))}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('featuresList.heading', t('features.heading'))}
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            {t('featuresList.description', t('features.description'))}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col p-6 bg-background rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}