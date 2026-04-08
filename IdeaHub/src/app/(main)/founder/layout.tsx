import RoleGuard from '@/components/common/RoleGuard';

export default function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard role="founder">{children}</RoleGuard>;
}
