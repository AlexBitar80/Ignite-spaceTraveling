import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { AiOutlineCalendar } from 'react-icons/ai';
import { RiUser3Line } from 'react-icons/ri';
import { FiClock } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const wordsPerMinute = 200;

  const timeReading: Number = Math.ceil(
    post.data.content.reduce((total, item) => {
      const heading = String(item.heading).split(' ');
      const body = RichText.asText(item.body).split(' ');
      return total + (body.length + heading.length);
    }, 0) / wordsPerMinute,
  );

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title> {post.data.title} | SpaceTraveling</title>
      </Head>
      <Header />
      <img className={styles.image} src={post.data.banner.url} alt={post.data.title} />
      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <div>
              <AiOutlineCalendar size={20} />
              <span>{format(
                new Date(post.first_publication_date),
                "dd MMM yyyy",
                {
                  locale: ptBR,
                }
              )}</span>
            </div>
            <div>
              <RiUser3Line size={20} />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock size={20} />
              <span>{timeReading} min</span>
            </div>
          </div>
          {post.data.content.map(content => (
            <section key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
              />
            </section>
          ))}
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    pageSize: 5,
  });

  const paths = posts.results.map(post => ({
    params: { slug: post.uid }
  }))

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 10 // 10 minutos
  }
};
