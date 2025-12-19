import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  SoredIcon,
  CalculatorIcon,
  BoxIcon,
  CogIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  EyeIcon,
} from './Icons';

describe('Icons Components', () => {
  it('deve renderizar SoredIcon com className', () => {
    const { container } = render(<SoredIcon className="test-class" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('test-class');
  });

  it('deve renderizar CalculatorIcon', () => {
    const { container } = render(<CalculatorIcon className="w-6 h-6" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-6');
    expect(svg).toHaveClass('h-6');
  });

  it('deve renderizar BoxIcon', () => {
    const { container } = render(<BoxIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar CogIcon', () => {
    const { container } = render(<CogIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar DocumentTextIcon', () => {
    const { container } = render(<DocumentTextIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar PlusIcon', () => {
    const { container } = render(<PlusIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar TrashIcon', () => {
    const { container } = render(<TrashIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar PencilIcon', () => {
    const { container } = render(<PencilIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar MagnifyingGlassIcon', () => {
    const { container } = render(<MagnifyingGlassIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar UserGroupIcon', () => {
    const { container } = render(<UserGroupIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar CheckIcon', () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar XMarkIcon', () => {
    const { container } = render(<XMarkIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar CheckCircleIcon', () => {
    const { container } = render(<CheckCircleIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar EyeIcon', () => {
    const { container } = render(<EyeIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('todos os ícones devem ter viewBox definido', () => {
    const icons = [
      SoredIcon,
      CalculatorIcon,
      BoxIcon,
      CogIcon,
      DocumentTextIcon,
      PlusIcon,
      TrashIcon,
      PencilIcon,
    ];

    icons.forEach((Icon) => {
      const { container } = render(<Icon />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('viewBox')).toBeTruthy();
    });
  });

  it('todos os ícones devem aceitar className customizada', () => {
    const customClass = 'custom-icon-class';
    const icons = [
      SoredIcon,
      CalculatorIcon,
      BoxIcon,
      CogIcon,
      DocumentTextIcon,
      PlusIcon,
      TrashIcon,
      PencilIcon,
    ];

    icons.forEach((Icon) => {
      const { container } = render(<Icon className={customClass} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass(customClass);
    });
  });

  it('ícones devem renderizar com fill ou stroke apropriados', () => {
    const { container } = render(<SoredIcon />);
    const svg = container.querySelector('svg');
    
    expect(svg?.getAttribute('fill')).toBeTruthy();
  });
});
