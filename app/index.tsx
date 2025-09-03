// app/index.tsx
import Loading from '@/components/common/Loading';

export default function Index() {
  // Just show loading while AuthGuard determines where to redirect
  return <Loading />;
}