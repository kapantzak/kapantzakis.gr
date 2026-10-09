export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}
