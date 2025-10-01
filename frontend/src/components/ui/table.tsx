import * as React from 'react';
import { cn } from '../../lib/utils';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto">
    <table className={cn('w-full min-w-[600px] border-collapse text-left text-sm', className)} {...props} />
  </div>
);

export const THead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn('bg-slate-50 text-xs uppercase tracking-wide text-slate-500', className)} {...props} />
);

export const TBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('divide-y divide-slate-100 bg-white', className)} {...props} />
);

export const TR: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('hover:bg-slate-50', className)} {...props} />
);

export const TH: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({ className, ...props }) => (
  <th className={cn('px-4 py-3 font-semibold', className)} {...props} />
);

export const TD: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement>> = ({ className, ...props }) => (
  <td className={cn('px-4 py-3 align-top', className)} {...props} />
);
