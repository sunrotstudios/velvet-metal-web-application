import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { AddServiceModal } from './AddServiceModal';

export function WelcomeMessage() {
  const { user } = useAuth();
  const [showAddService, setShowAddService] = useState(false);

  return (
    <>
      <Card className="border-2 bg-gradient-to-br from-background to-accent/5">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Velvet Metal
          </h1>
          <p className="text-lg text-muted-foreground">
            Your new home for music discovery and library management
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard
                title="Connect Your Services"
                description="Link your Spotify and Apple Music accounts to sync your entire music library"
              />
              <FeatureCard
                title="Unified Library"
                description="Access all your music in one place, regardless of which service it's from"
              />
              <FeatureCard
                title="Smart Playlists"
                description="Create dynamic playlists that update automatically based on your listening habits"
              />
              <FeatureCard
                title="Music Discovery"
                description="Discover new music through personalized recommendations and curated playlists"
              />
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="px-8"
              onClick={() => setShowAddService(true)}
            >
              Connect Your First Service
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddServiceModal
        open={showAddService}
        onOpenChange={setShowAddService}
      />
    </>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border bg-card/50">
      <CardContent className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
