import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt/dist/services';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  Request,
  requestBody,
  RestBindings,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Article} from '../models';
import {ArticleRepository} from '../repositories';

export class ArticleController {
  constructor(
    @repository(ArticleRepository)
    public articleRepository: ArticleRepository,
    @inject(RestBindings.Http.REQUEST) public req: Request,
  ) {}

  @authenticate('jwt')
  @post('/articles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Article model instance',
        content: {'application/json': {schema: getModelSchemaRef(Article)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Article, {
            title: 'NewArticle',
          }),
        },
      },
    })
    article: Article,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ): Promise<object> {
    article.userId = currentUser.id;

    const newArticle = await this.articleRepository.create(article);

    return {
      status: 'success',
      data: {
        message: 'Article successfully posted',
        articleId: newArticle.id,
        title: newArticle.title,
      },
    };
  }

  @patch('/articles/{id}', {
    responses: {
      '204': {
        description: 'Article PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Article, {partial: true}),
        },
      },
    })
    article: Article,
  ): Promise<object> {
    // const {title, content} = this.req.body;
    // const articleUpdate = {
    //   title,
    //   content,
    // };
    // await Article.update(
    //   {title: articleUpdate.title, article: articleUpdate.article},
    //   {where: {id}},
    // );
    const updatedArticle = await this.articleRepository.updateById(id, article);
    console.log(updatedArticle);

    return {
      status: 'success',
      data: {
        message: 'Article successfully updated',
        // articleId: updatedArticle.id,
        // title: updatedArticle.title,
      },
    };
  }

  @get('/articles/count', {
    responses: {
      '200': {
        description: 'Article model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Article) where?: Where<Article>): Promise<Count> {
    return this.articleRepository.count(where);
  }

  @get('/articles', {
    responses: {
      '200': {
        description: 'Array of Article model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Article, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Article) filter?: Filter<Article>,
  ): Promise<Article[]> {
    return this.articleRepository.find(filter);
  }

  // @patch('/articles', {
  //   responses: {
  //     '200': {
  //       description: 'Article PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Article, {partial: true}),
  //       },
  //     },
  //   })
  //   article: Article,
  //   @param.where(Article) where?: Where<Article>,
  // ): Promise<Count> {
  //   return this.articleRepository.updateAll(article, where);
  // }

  @get('/articles/{id}', {
    responses: {
      '200': {
        description: 'Article model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Article, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Article, {exclude: 'where'})
    filter?: FilterExcludingWhere<Article>,
  ): Promise<Article> {
    return this.articleRepository.findById(id, filter);
  }

  @put('/articles/{id}', {
    responses: {
      '204': {
        description: 'Article PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() article: Article,
  ): Promise<void> {
    await this.articleRepository.replaceById(id, article);
  }

  @del('/articles/{id}', {
    responses: {
      '204': {
        description: 'Article DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.articleRepository.deleteById(id);
  }
}
