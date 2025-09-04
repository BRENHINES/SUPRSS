// src/components/app/PageHeader.tsx
import React from "react";

const PageHeader: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="mb-6 flex items-center justify-between gap-3">
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
      {subtitle && <p className="text-neutral-600 mt-1">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export default PageHeader;
