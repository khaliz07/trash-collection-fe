import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    {
      number: '01',
      title: t('how_it_works.steps.0.title'),
      description: t('how_it_works.steps.0.description'),
      checks: [
        t('how_it_works.steps.0.checks.0'),
        t('how_it_works.steps.0.checks.1'),
        t('how_it_works.steps.0.checks.2')
      ]
    },
    {
      number: '02',
      title: t('how_it_works.steps.1.title'),
      description: t('how_it_works.steps.1.description'),
      checks: [
        t('how_it_works.steps.1.checks.0'),
        t('how_it_works.steps.1.checks.1'),
        t('how_it_works.steps.1.checks.2')
      ]
    },
    {
      number: '03',
      title: t('how_it_works.steps.2.title'),
      description: t('how_it_works.steps.2.description'),
      checks: [
        t('how_it_works.steps.2.checks.0'),
        t('how_it_works.steps.2.checks.1'),
        t('how_it_works.steps.2.checks.2')
      ]
    },
    {
      number: '04',
      title: t('how_it_works.steps.3.title'),
      description: t('how_it_works.steps.3.description'),
      checks: [
        t('how_it_works.steps.3.checks.0'),
        t('how_it_works.steps.3.checks.1'),
        t('how_it_works.steps.3.checks.2')
      ]
    }
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-16">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
            <span className="text-primary mr-1">🔄</span>
            <span>{t('how_it_works.simple_process')}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('how_it_works.heading')}
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            {t('how_it_works.description')}
          </p>
        </div>
        <div className="grid gap-12 md:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="grid md:grid-cols-5 gap-6 md:gap-12 items-center">
              <div className={`md:col-span-2 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl overflow-hidden border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold text-primary/30">
                      {t('how_it_works.stepLabel', { number: step.number })}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`md:col-span-3 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="space-y-4">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  <ul className="space-y-2 pt-2">
                    {step.checks.map((check, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary/70" />
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}