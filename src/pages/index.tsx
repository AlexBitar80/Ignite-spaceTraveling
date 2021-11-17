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
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface PostProps {
  postsPagination: PostPagination;
}

export default function Posts({ postsPagination }: PostProps) {

  const [posts, setPosts] = useState();

  function handleLoadMorePosts() {

  }

  return (
    <>
      <Head>
        <title>SpaceTraveling | posts</title>
      </Head>
      <main className={commonStyles.container}>
        <Header />
        <div className={styles.postList}>
          {postsPagination.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <div className={styles.info}>
                  <div>
                    <AiOutlineCalendar size={20} />
                    <span>{post.first_publication_date}</span>
                  </div>
                  <div>
                    <RiUser3Line size={20} />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {postsPagination.next_page !== null && (
            <button onClick={handleLoadMorePosts}>
              Carregar mais posts
            </button>
          )}
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

  const postsPagination = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  return {
    props: {
      postsPagination
    },
    // revalidate: 60 * 10 // 10 minutos
  }
}
