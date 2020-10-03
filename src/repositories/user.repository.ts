import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {TeamworkDataSource} from '../datasources';
import {User, UserRelations, Article} from '../models';
import {ArticleRepository} from './article.repository';

export type Credentials = {
  email: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly articles: HasManyRepositoryFactory<Article, typeof User.prototype.id>;

  constructor(@inject('datasources.teamwork') dataSource: TeamworkDataSource, @repository.getter('ArticleRepository') protected articleRepositoryGetter: Getter<ArticleRepository>,) {
    super(User, dataSource);
    this.articles = this.createHasManyRepositoryFactoryFor('articles', articleRepositoryGetter,);
    this.registerInclusionResolver('articles', this.articles.inclusionResolver);
  }
}
