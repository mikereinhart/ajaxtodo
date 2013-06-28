class TasksController < ApplicationController
  def new
    @task = Task.new
    @tasks = Task.joins(:priority).order('priorities.urgency_index DESC, name ASC' )
    @priorities = Priority.all
  end

  def create
    task = Task.new(params[:task])
    task.save!
    #Instead of rendering text, I render JSON so that the task and all of its attributes are available
    #in the data variable in my javascript callback function
    render json: {task: task, priority: task.priority}
  end

  def destroy
    #1 - get the ID of the item we wish to destroy
    task = Task.find(params[:id])
    # 2 - delete the item with that ID from the DB
    task.destroy
    # 3 - render some sort of response or redirect
    render json: task
  end  

  def update
    task = Task.find(params[:id])
    task.update_attributes(params[:task])

    render json: {task: task, priority: task.priority}
  end

  def move(array_shift)
    # id = params[:id]
    task = Task.find(params[:id])
    priorities = Priority.order(:urgency_index)
    urgency_index_array = priorities.map{|p| p.urgency_index}
    urgency_index_array = urgency_index_array.uniq
    # priority = task.priority.urgency_index

  end

  def moveup
    # data = arrow(1)
    # data = "funions"
    task = Task.find(params[:id])

    task.increase_urgency

    render json: {task: task, priority: task.priority}

    # render text: 'moveup method!!'
  end


  def movedown
    # data = arrow(-1)
    # render json: data
    puts 'move up method!'
  end

end












