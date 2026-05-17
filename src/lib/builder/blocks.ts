import { generateId } from './store'
import type { BuilderNode } from './types'

export type BlockGeneratorResult = {
  rootId: string
  nodes: Record<string, BuilderNode>
}

// Generates a pre-styled Profile Card
export const createProfileCardBlock = (): BlockGeneratorResult => {
  const cardId = generateId()
  const imgId = generateId()
  const contentWrapperId = generateId()
  const titleId = generateId()
  const descId = generateId()
  const btnId = generateId()

  return {
    rootId: cardId,
    nodes: {
      [cardId]: {
        id: cardId,
        type: 'Container',
        parent: null, // Will be set by addNodeTree
        isCanvas: true,
        children: [imgId, contentWrapperId],
        props: {
          className:
            'flex flex-col overflow-hidden bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-sm w-full max-w-sm',
        },
      },
      [imgId]: {
        id: imgId,
        type: 'Image',
        parent: cardId,
        children: [],
        props: {
          src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop',
          alt: 'Profile',
          className: 'w-full h-48 object-cover',
        },
      },
      [contentWrapperId]: {
        id: contentWrapperId,
        type: 'Container',
        parent: cardId,
        isCanvas: true,
        children: [titleId, descId, btnId],
        props: { className: 'flex flex-col gap-3 p-6' },
      },
      [titleId]: {
        id: titleId,
        type: 'Typography',
        parent: contentWrapperId,
        children: [],
        props: { variant: 'title-large', children: 'Jane Doe', className: 'font-bold' },
      },
      [descId]: {
        id: descId,
        type: 'Typography',
        parent: contentWrapperId,
        children: [],
        props: {
          variant: 'body-medium',
          children: 'Lead UX Designer based in San Francisco. Passionate about interfaces.',
          className: 'opacity-70',
        },
      },
      [btnId]: {
        id: btnId,
        type: 'Button',
        parent: contentWrapperId,
        children: [],
        props: { variant: 'primary', size: 'sm', children: 'Follow', className: 'mt-2 self-start' },
      },
    },
  }
}

// Generates a simple Hero Section
export const createHeroBlock = (): BlockGeneratorResult => {
  const heroId = generateId()
  const titleId = generateId()
  const subId = generateId()
  const btnId = generateId()

  return {
    rootId: heroId,
    nodes: {
      [heroId]: {
        id: heroId,
        type: 'Container',
        parent: null,
        isCanvas: true,
        children: [titleId, subId, btnId],
        props: {
          className:
            'flex flex-col items-center justify-center gap-6 py-24 px-4 text-center bg-surface-container-highest rounded-3xl',
        },
      },
      [titleId]: {
        id: titleId,
        type: 'Typography',
        parent: heroId,
        children: [],
        props: { variant: 'display-medium', children: 'Build Faster', className: 'font-extrabold max-w-2xl' },
      },
      [subId]: {
        id: subId,
        type: 'Typography',
        parent: heroId,
        children: [],
        props: {
          variant: 'body-large',
          children: 'Use our drag and drop editor to build your site in minutes.',
          className: 'opacity-80 max-w-xl',
        },
      },
      [btnId]: {
        id: btnId,
        type: 'Button',
        parent: heroId,
        children: [],
        props: { variant: 'primary', size: 'lg', children: 'Get Started', shape: 'full' },
      },
    },
  }
}

// Map of block generators
export const BLOCK_GENERATORS: Record<string, () => BlockGeneratorResult> = {
  ProfileCard: createProfileCardBlock,
  HeroSection: createHeroBlock,
}
