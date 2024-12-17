import React, { useState } from 'react';
import { useLastFm } from '../../contexts/LastFmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const LastFmConnect: React.FC = () => {
  const { username, setUsername } = useLastFm();
  const [inputUsername, setInputUsername] = useState(username || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsername(inputUsername);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Last.fm Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Last.fm Username
            </label>
            <Input
              type="text"
              id="username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Enter your Last.fm username"
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Connect Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
