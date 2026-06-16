import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, setToken, type Employee } from '@/lib/api';

export default function LoginScreen({ onLogin }: { onLogin: (e: Employee) => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.login(login, password);
      setToken(res.token);
      onLogin(res.employee);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gov-pattern p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-md bg-primary/15 border border-primary/40 items-center justify-center mb-4">
            <Icon name="Landmark" className="text-primary" size={30} />
          </div>
          <h1 className="font-serif text-4xl text-primary tracking-wide">ЗАГС</h1>
          <p className="text-sm text-muted-foreground mt-1 uppercase tracking-[0.2em]">
            Единый реестр актов
          </p>
        </div>

        <div className="bg-card/70 border border-border rounded-lg p-7 backdrop-blur-sm">
          <h2 className="font-serif text-xl mb-5 text-center">Вход в систему</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Логин</Label>
              <Input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                className="bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Пароль</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                className="bg-secondary/40"
              />
            </div>
            {error && (
              <div className="text-sm text-destructive flex items-center gap-2">
                <Icon name="CircleAlert" size={16} />
                {error}
              </div>
            )}
            <Button
              onClick={submit}
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Вход...' : 'Войти'}
              {!loading && <Icon name="LogIn" size={18} className="ml-2" />}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}