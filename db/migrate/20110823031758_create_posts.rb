class CreatePosts < ActiveRecord::Migration
  def self.up
    create_table :posts do |t|
      t.string    :author
      t.integer   :sequence
      t.datetime  :posted_on
      t.integer   :link_id
      t.text      :content
      t.timestamps
    end
  end

  def self.down
    drop_table :posts
  end
end
