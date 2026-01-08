import Link from "next/link";

import { HydrateClient } from "~/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            DealMind
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/login"
            >
              <h3 className="text-2xl font-bold">Login →</h3>
              <div className="text-lg">
                Acesse sua conta DealMind
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/register"
            >
              <h3 className="text-2xl font-bold">Cadastre-se →</h3>
              <div className="text-lg">
                Crie sua conta e comece a usar
              </div>
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
