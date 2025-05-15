import { Quote } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      quote: "The EcoCollect app has made managing our household waste so much easier. I love getting notifications before collection day!",
      author: "Sarah Johnson",
      role: "Household User",
      rating: 5
    },
    {
      quote: "As a waste collector, the routing and check-in features have made my job much more efficient. I can serve more households in less time.",
      author: "Michael Torres",
      role: "Collection Staff",
      rating: 5
    },
    {
      quote: "I requested an urgent pickup after a family gathering, and a collector arrived within hours. The service exceeded my expectations.",
      author: "David Chen",
      role: "Household User",
      rating: 4
    },
    {
      quote: "Managing our city's waste collection has never been easier. The analytics dashboard gives us valuable insights to improve our service.",
      author: "Lisa Rodriguez",
      role: "Municipal Administrator",
      rating: 5
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-16">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
            <span className="text-primary mr-1">❤️</span>
            <span>Trusted By Many</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            What our users are saying
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            Don't take our word for it. Hear from the households and collection staff who use EcoCollect every day.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="flex flex-col p-6 bg-background rounded-xl border shadow-sm"
            >
              <div className="mb-4 text-primary">
                <Quote className="h-8 w-8 opacity-50" />
              </div>
              <p className="flex-1 text-lg mb-4">{testimonial.quote}</p>
              <div className="mt-auto pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={i < testimonial.rating ? "currentColor" : "none"}
                        stroke={i < testimonial.rating ? "none" : "currentColor"}
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? "text-amber-500" : "text-muted-foreground"
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}