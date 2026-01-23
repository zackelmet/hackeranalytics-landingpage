import React from 'react';
import classNames from 'classnames';

const PainPointCard = ({icon, title, text}) => (
  <article className="pain-point-card">
    <div className="pain-point-deco" aria-hidden />
    <div className="pain-point-icon">
      {typeof icon === 'string' ? (
        <img src={icon} alt={`${title} icon`} style={{width: '48px', height: '48px', objectFit: 'contain'}} />
      ) : (
        icon
      )}
    </div>
    <h3 className="pain-point-title">{title}</h3>
    <p className="pain-point-text">{text}</p>
  </article>
);

export default function PainPointsSection({elementId, items = [], className}) {
  return (
    <section id={elementId} className={classNames('pain-points-section', className)}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="section-header">
          <span className="badge-glow">Stop fighting with your infrastructure</span>
          <h2 className="text-3xl font-extrabold mt-4">Common pain points we remove</h2>
          <p className="mt-3 text-lg subtitle max-w-2xl">These problems keep security teams busy. We take them off your plate so your engineers can focus on defense.</p>
        </div>

        <div className="pain-points-grid mt-10">
          {items.map((it, idx) => (
            <PainPointCard key={idx} {...it} />
          ))}
        </div>
      </div>
    </section>
  );
}
