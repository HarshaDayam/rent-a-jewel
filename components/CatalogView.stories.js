import React from 'react';
import CatalogView from './CatalogView';
import { mockProducts } from '../data/mockProducts';
import '../app/globals.css';

export default {
  title: 'Components/CatalogView',
  component: CatalogView,
  decorators: [
    (Story) => (
      <div style={{ background: '#FAF3E7', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <Story />
      </div>
    ),
  ],
};

const Template = (args) => <CatalogView {...args} />;

export const DefaultCatalog = Template.bind({});
DefaultCatalog.args = {
  products: mockProducts,
};

export const EmptyCatalog = Template.bind({});
EmptyCatalog.args = {
  products: [],
};
