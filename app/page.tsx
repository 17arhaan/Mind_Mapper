import { MindMapper } from "@/components/mind-mapper"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-black">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-beige">Mind Mapper</h1>
        <p className="text-center text-beige/70 mb-8">Transform any prompt into an interactive mind map</p>
        <MindMapper />
      </div>
    </main>
  )
}
