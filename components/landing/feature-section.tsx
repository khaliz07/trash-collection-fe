import { 
  Calendar, 
  Bell, 
  CreditCard, 
  Clock, 
  Map, 
  BarChart, 
  Shield, 
  Star
} from 'lucide-react'

export function FeatureSection() {
  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Smart Scheduling",
      description: "Access your collection schedule based on your location and service type."
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Real-time Notifications",
      description: "Get notified before collection time and when your waste has been collected."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Flexible Payments",
      description: "Choose from monthly, quarterly, or yearly subscription plans with easy payment options."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Urgent Pickups",
      description: "Request special collection outside your regular schedule when needed."
    },
    {
      icon: <Map className="h-6 w-6" />,
      title: "Location Tracking",
      description: "Track collection staff location and status in real-time on collection days."
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Collection Analytics",
      description: "View your waste collection history and environmental impact statistics."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Collections",
      description: "Collection staff check-in with photo verification for quality assurance."
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Rate Your Service",
      description: "Provide feedback after each collection to help us improve."
    }
  ]

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-16">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
            <span className="text-primary mr-1">✨</span>
            <span>Powerful Features</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need for waste management
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            Our platform brings together households, collection staff, and administrators in one unified ecosystem.
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