"use client";

import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ClientOnly({ children }: Props) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
