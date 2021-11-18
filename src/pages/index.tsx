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

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
          locale: ptBR,
        }
      ),
    }
  })

  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);


  async function handleLoadMorePosts(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const resultPosts = await fetch(nextPage).then(response => response.json());

    setNextPage(resultPosts.next_page);
    setCurrentPage(resultPosts.page);

    const morePosts = resultPosts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "dd MMM yyyy",
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })

    setPosts([...posts, ...morePosts]);
  }

  return (
    <>
      <Head>
        <title>SpaceTraveling | posts</title>
      </Head>
      <main className={commonStyles.container}>
        <Header />
        <div className={styles.postList}>
          {posts.map(post => (
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
          {nextPage && (
            <button type="button" onClick={handleLoadMorePosts}>
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
    pageSize: 1,
  });

  const posts = response.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    }
  }));

  const postsPagination = {
    results: posts,
    next_page: response.next_page,
  }

  return {
    props: {
      postsPagination
    },
    revalidate: 60 * 10 // 10 minutos
  }
}
