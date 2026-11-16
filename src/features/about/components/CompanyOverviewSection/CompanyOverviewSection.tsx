import SectionContainer from '@/shared/components/Container/SectionContainer';
import CountUp from '@/shared/components/CountUp/CountUp';
import Reveal from '@/shared/components/Reveal/Reveal';

const STATS = [
  {
    value: 5000,
    suffix: '+',
    label: 'Happy Families',
  },
  {
    value: 75,
    suffix: '+',
    label: 'Completed Projects',
  },
  {git stash apply 'stash@{1}'
    value: 70,
    suffix: 'L+ Sq.Ft.',
    label: 'Area Developed',
  },
];

const CompanyOverviewSection = () => {
  return (
    <SectionContainer bgClassName="bg-background-dark">
      <div className="mt-16 grid items-center gap-16 lg:grid-cols-[0.95fr_1fr]">
        <Reveal>
          <div className="relative mx-auto w-full max-w-137.5">
            <img
              src="/company-overview.jpg"
              alt="Company Overview"
              className="h-130 md:h-180 w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'rgba(255,255,255,0.8)',
                mixBlendMode: 'saturation',
              }}
            />
            <div
              className="absolute bottom-5 right-5 w-47.5 overflow-hidden text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(64px)',
              }}
            >
              {STATS.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`p-5 md:p-8 ${
                    index !== STATS.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2500}
                    className="font-heading-anton text-xl md:text-3xl leading-none text-primary"
                  />
                  <p className="mt-2 text-xs uppercase text-white/80 text-montserrat">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="max-w-140">
          <Reveal>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-primary text-montserrat">
              The Archive Philosophy
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="font-heading text-lg leading-tight text-white md:text-2xl lg:text-4xl">
              Creating Landmarks That Stand the Test of Time
            </h3>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-10 leading-6 text-white text-montserrat text-sm">
              The finest developments are measured not by their height, but by
              the legacy they leave behind. At H. Rishabraj, every project is
              conceived with a long term vision, where architectural excellence,
              thoughtful planning, and uncompromising quality come together to
              create timeless destinations.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-8 leading-6 text-white text-montserrat text-sm">
              As Mumbai continues to evolve, we remain committed to shaping its
              future through luxury residences that elevate lifestyles,
              strengthen communities, and deliver enduring value. Every landmark
              we create is a reflection of our promise to build with purpose,
              precision, and integrity.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-12 flex items-center gap-4">
              <span className="h-px w-12 bg-primary" />

              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary text-montserrat">
                Our Legacy
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionContainer>
  );
};

export default CompanyOverviewSection;
