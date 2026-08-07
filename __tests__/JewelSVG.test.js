import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JewelSVG from '../components/JewelSVG';

describe('JewelSVG Component', () => {
  it('should render the vector SVG by default if no imageUrl is provided', () => {
    const { container } = render(<JewelSVG category="Necklace" productId="p1" />);
    
    // Validate an SVG node was created
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    
    // Check that we drew vector circles for beads
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('should render the img tag if a valid imageUrl is provided', () => {
    const testUrl = 'https://cdn.shopify.com/files/image.jpg';
    const { container } = render(<JewelSVG category="Necklace" productId="p1" imageUrl={testUrl} altText="Leaf Necklace" />);
    
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', testUrl);
    expect(imgElement).toHaveAttribute('alt', 'Leaf Necklace');
  });

  it('should fall back to SVG vector if img load fails', () => {
    const testUrl = 'https://invalid-domain.com/non-existent.jpg';
    const { container } = render(<JewelSVG category="Necklace" productId="p1" imageUrl={testUrl} />);
    
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeInTheDocument();

    // Trigger an image error event
    fireEvent.error(imgElement);

    // Assert the img node is unmounted and the fallback svg is mounted
    expect(container.querySelector('img')).not.toBeInTheDocument();
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
});
