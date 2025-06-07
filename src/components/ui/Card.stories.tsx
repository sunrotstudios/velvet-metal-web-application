import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { FeaturedContent, SubmitSongCard } from '../landing/DesignElements';

const meta = {
  title: 'Basic Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some example text that might represent something meaningful.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>This card has a footer with actions</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This example shows how to compose a card with multiple elements including buttons in the footer.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="noShadow" size="sm">Cancel</Button>
        <Button variant="default" size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const Featured: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Featured Content</CardTitle>
        <CardDescription>A highlighted card with custom styling</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] rounded-md bg-muted flex items-center justify-center">
          Featured Image Placeholder
        </div>
        <p className="mt-4">This card demonstrates how to create a featured content card with an image area.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  ),
};

export const CardComparison: Story = {
  render: () => (
    <div className="flex flex-col space-y-8 max-w-[900px]">
      <div>
        <h3 className="mb-2 font-medium text-gray-500">Standard UI Cards:</h3>
        <div className="flex flex-wrap gap-4">
          <Card className="w-[280px]">
            <CardHeader>
              <CardTitle>Dashboard Card</CardTitle>
              <CardDescription>For application content</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Used for structured data in the application.</p>
            </CardContent>
          </Card>
          
          <Card className="w-[280px]">
            <CardHeader>
              <CardTitle>Data Card</CardTitle>
              <CardDescription>For information display</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[100px] rounded-md bg-slate-100 flex items-center justify-center">
                Data Visualization
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">View More</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div>
        <h3 className="mb-2 font-medium text-gray-500">Landing Page Cards:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="w-[280px]">
            <FeaturedContent />
          </div>
          
          <div className="w-[280px]">
            <SubmitSongCard />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <h3 className="mb-2 font-medium text-gray-500">When to use which card style:</h3>
          <ul className="list-disc pl-5 text-sm">
            <li><strong>Standard UI Cards</strong>: For dashboard, user account pages, and data presentation</li>
            <li><strong>Landing Page Cards</strong>: For marketing pages, product showcases, and CTAs</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};