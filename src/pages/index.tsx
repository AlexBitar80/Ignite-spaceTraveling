import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../components/Header';

import { AiOutlineCalendar } from 'react-icons/ai';
import { RiUser3Line } from 'react-icons/ri';

import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';


type Post = {
  slug: string;
  title: string;
  author: string;
  subtitle: string;
  updatedAt: string;
}

interface PostProps {
  posts: Post[]
}

export default function Posts({ posts }: PostProps) {
  return (
    <>
      <Head>
        <title>SpaceTraveling | posts</title>
      </Head>
      <main className={commonStyles.container}>
        <Header />
        <div className={styles.postList}>
          {posts.map(post => (
            <Link href={`/post/${post.slug}`} key={post.slug}>
              <a>
                <h1>{post.title}</h1>
                <p>{post.subtitle}</p>

                <div className={styles.info}>
                  <div>
                    <AiOutlineCalendar size={20} />
                    <span>{post.updatedAt}</span>
                  </div>
                  <div>
                    <RiUser3Line size={20} />
                    <span>{post.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 100,
  });

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
      updatedAt: format(
        new Date(post.last_publication_date),
        "d MMM yyyy",
        {
          locale: ptBR,
        }
      )
    }
  })

  return {
    props: {
      posts
    },
    // revalidate: 60 * 10 // 10 minutos
  }
}
