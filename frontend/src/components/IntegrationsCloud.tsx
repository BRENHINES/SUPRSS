// src/components/marketing/IntegrationsOrbit.tsx
import * as React from "react";
import { motion } from "framer-motion";

type ItemProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export const Item: React.FC<ItemProps> = ({ label, children, className = "" }) => (
  <div
    title={label}
    aria-label={label}
    className={[
      "grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl",
      "bg-white/90 dark:bg-white/10 backdrop-blur",
      "border border-black/5 dark:border-white/10 shadow",
      "text-neutral-800 dark:text-neutral-100",
      "hover:scale-105 transition-transform",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

// Helpers
function polarToCartesian(radiusPct: number, angleDeg: number) {
  const r = (Math.PI / 180) * angleDeg;
  return { x: Math.cos(r) * radiusPct, y: Math.sin(r) * radiusPct };
}

// petit décalage déterministe pour casser l’alignement parfait
function jitter(index: number, max = 12) {
  // génère un offset entre -max/2 et +max/2 de façon stable
  const v = (index * 37) % max; // 37 = nombre premier pour “mixer”
  return v - max / 2;
}

const ringStroke = "stroke-black/10 dark:stroke-white/10";

export const IntegrationsOrbit: React.FC<
  React.PropsWithChildren<{ className?: string; autoRotate?: boolean }>
> = ({ children, className = "", autoRotate = true }) => {
  const items = React.Children.toArray(children);

  // 3 orbites (du centre vers l’extérieur)
  const radii = [22, 35, 46]; // en % du carré
  const ringCount = radii.length;

  // Répartition pseudo-aléatoire mais stable: index % ringCount
  const rings: React.ReactNode[][] = Array.from({ length: ringCount }, () => []);
  items.forEach((child, i) => rings[i % ringCount].push(child));

  // vitesses + sens différents
  const durations = [70, 90, 110]; // secondes par tour
  const directions = [1, -1, 1]; // horaire, anti, horaire

  return (
    <div
      className={[
        "relative isolate overflow-hidden rounded-3xl",
        "bg-teal-900 dark:bg-teal-900",
        "ring-1 ring-black/5 dark:ring-white/5 p-6 sm:p-8",
        className,
      ].join(" ")}
    >
      {/* carré = cercle parfait */}
      <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
        {/* Concentric rings */}
        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
          {radii.map((r, i) => (
            <circle key={i} cx="50%" cy="50%" r={`${r}%`} className={ringStroke} fill="none" strokeWidth="1.5" />
          ))}
        </svg>

        {/* Chaque orbite a sa rotation propre */}
        {rings.map((group, ringIdx) => {
          const radius = radii[ringIdx];
          const step = 360 / Math.max(1, group.length);
          const baseOffset = ringIdx * 10; // décale les groupements entre anneaux

          return (
            <motion.div
              key={ringIdx}
              className="absolute inset-0"
              animate={autoRotate ? { rotate: 360 * directions[ringIdx] } : undefined}
              transition={{
                duration: durations[ringIdx],
                repeat: Infinity,
                repeatType: "loop",
              }}
              style={{ originX: "50%", originY: "50%" }}
            >
              {group.map((node, idx) => {
                const angle = baseOffset + idx * step + jitter(idx, 16) - 90; // commence en haut
                const { x, y } = polarToCartesian(radius, angle);
                return (
                  <motion.div
                    key={idx}
                    className="absolute"
                    style={{
                      left: `calc(50% + ${x}%)`,
                      top: `calc(50% + ${y}%)`,
                      translate: "-50% -50%",
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35 }}
                  >
                    {node}
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
