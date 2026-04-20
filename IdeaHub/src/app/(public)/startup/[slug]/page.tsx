import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ideaService } from '@/services/idea.service';
import StartupDetailClient from '@/components/startup/StartupDetailClient';

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const idea = await ideaService.getPublicIdeaBySlug(slug, { increment: false });

    if (!idea) return { title: 'Startup Not Found | IdeaHub' };

    return {
        title: `${idea.title} | IdeaHub Showcase`,
        description: idea.tagline || idea.problemStatement?.slice(0, 160),
        openGraph: {
            title: idea.title,
            description: idea.tagline || idea.problemStatement?.slice(0, 160),
            type: 'website',
        }
    };
}

export default async function StartupDetailPage({ params }: Props) {
    const { slug } = await params;
    const idea = await ideaService.getPublicIdeaBySlug(slug);

    if (!idea) return notFound();

    const plainIdea = JSON.parse(JSON.stringify(idea));

    return <StartupDetailClient idea={plainIdea} />;
}
