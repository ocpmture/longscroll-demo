class Post < ActiveRecord::Base
  belongs_to :link
  
  cattr_reader :per_page, :keep_factor
  @@per_page = 20
  @@keep_factor = 3
  
  scope :with_link, lambda {|link_id| where(:link_id => link_id)}
  
end
