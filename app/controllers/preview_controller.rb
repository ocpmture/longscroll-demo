class PreviewController < ApplicationController
  before_filter :page_info, :only => [:show, :plain, :info]
  
  def all
    @posts = Post.all
    render :partial => "preview/entries", :layout => false
  end
  
  # def index
  #   @links = Link.all
  # end

  def show
    if request.xhr?
      render :partial => "entries"
    end
  end

  def plain
    render :layout => false
  end
  
  def info
      render :json => {:numEntries => @count}
  end
  
  private
  
  def page_info
    @conditions = {:link_id => params[:id]}
    @posts = Post.where(@conditions).paginate :per_page => Post.per_page,  :page => params[:page] || 1
    @count = Post.where(@conditions).count 
  end
  
end
