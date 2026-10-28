import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Providers from "@/components/Providers";
import Headers from "@/components/RootBody/Headers";
import Footer from "@/components/RootBody/Footer";
import RootBody from "@/components/RootBody";

const meta: Meta = {
  title: "FT/Shell",
};

export default meta;

type Story = StoryObj;

export const WithPlaceholder: Story = {
  render: () => (
    <Providers>
      <RootBody>
        <Headers />
        <main style={{ padding: 24 }}>
          <h1>FT Shell Placeholder</h1>
          <p>
            Use this shell to build your experience. Replace this content with
            your app.
          </p>
        </main>
      </RootBody>
      <Footer />
    </Providers>
  ),
};

