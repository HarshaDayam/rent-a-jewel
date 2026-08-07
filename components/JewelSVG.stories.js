import React from 'react';
import JewelSVG from './JewelSVG';

export default {
  title: 'Components/JewelSVG',
  component: JewelSVG,
  argTypes: {
    category: {
      control: { type: 'select' },
      options: ['Necklace', 'Choker', 'Haram', 'Bridal', 'Bangles', 'Earrings'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px', height: '320px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};

const Template = (args) => <JewelSVG {...args} />;

export const Necklace = Template.bind({});
Necklace.args = {
  category: 'Necklace',
  productId: 'p1',
};

export const Choker = Template.bind({});
Choker.args = {
  category: 'Choker',
  productId: 'p2',
};

export const Haram = Template.bind({});
Haram.args = {
  category: 'Haram',
  productId: 'p3',
};

export const Bridal = Template.bind({});
Bridal.args = {
  category: 'Bridal',
  productId: 'p4',
};

export const Bangles = Template.bind({});
Bangles.args = {
  category: 'Bangles',
  productId: 'p5',
};

export const Earrings = Template.bind({});
Earrings.args = {
  category: 'Earrings',
  productId: 'p6',
};

export const WithShopifyImage = Template.bind({});
WithShopifyImage.args = {
  category: 'Necklace',
  productId: 'p1',
  imageUrl: 'https://cdn.shopify.com/s/files/1/0725/4687/7487/files/WhatsAppImage2025-12-17at3.54.13PM.jpg?v=1765967074&width=900',
  altText: 'Leaf Design Necklace Set',
};

export const ImageLoadFailureFallback = Template.bind({});
ImageLoadFailureFallback.args = {
  category: 'Necklace',
  productId: 'p1',
  imageUrl: 'https://invalid-domain-name-testing.com/image.jpg',
  altText: 'This will fail to load and show vector drawing instead',
};
