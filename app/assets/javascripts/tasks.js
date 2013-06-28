var sort_column;

function add_node(task) {
  task_name = task.children('.name').text();
  task_urgency = task.children('.urgency-index').text();
  var row_list = $('#tasks tbody').children();

  for(var i=0; i< row_list.size(); i++){
    node = $(row_list[i]);
    node_name = node.children('.name').text();
    node_urgency = node.children('.urgency-index').text();

    if (task_urgency > node_urgency) {
      task.insertBefore(node);
      return;
    } else if ((task_urgency == node_urgency) && task_name < node_name){
      task.insertBefore(node);
      return;
    }
  }
  $('#tasks tbody').append(task);
}

//A field-agnostic single-column sorter
// this is a function with a dynamically changing jquery selector. it condenses the 3 functions 
// for sort_by_name/desc/duedate. SEE THE TEXT THAT REFERENCES THIS FUNCTION BELOW THE DOCUMENT.READY ( $(function){ ) - lines 58 - 67
function sort_by_column(a, b){
  col_a = $(a).children('.'+sort_column).text();
  col_b = $(b).children('.'+sort_column).text();
  if(col_a > col_b){
    return 1;
  } else if (col_a < col_b){
    return -1;
  } else {
    return 0;
  }
}

// EDIT
function bind_edit_button(edit_button){
  edit_button.on('click', function(e) {
    e.preventDefault();
    var task_id = $(this).data('id');
    $('#edit-submit').attr('data-id', task_id);
    var task_row = $(this).parent().parent();
    // find the value of name for the given task
    var name = task_row.find('.name').text();
    // now assign that value to the 'task_name' field in the form
    $('#task_name').val(name.trim());

    // DUPLICATING THE 'NAME' PORTION FOR OTHER FIELDS:
    var desc = task_row.find('.desc').text();
    $('#task_desc').val(desc.trim());
    var duedate = task_row.find('.duedate').text();
    $('#task_duedate').val(duedate.trim());
    // the priority urgency_index is much harder to update than the others:
    var priority_id = task_row.find('.priority_id').text();
    $('#task_priority_id option[value=' + priority_id +']').prop('selected', true);

    // REFACTORING THE ABOVE CODE USING THE UNDERSCORE.JS LIBRARY
    // _.each(['name', 'desc', 'duedate'], function(attr_name) {
    //   $('#task_' + attr_name).val(task_row.children('.'+attr_name).text().trim());
    // });
    $('#submit').addClass('hidden');
    $('#edit-submit').removeClass('hidden');
  });
}

// activates the event handler binding to the delete buttons in the table.
function bind_delete_button_action_to(link_element) {
  // takes a jquery element named link_element, and applies a .on(etc.)
  link_element.on('click', function(e) {
    e.preventDefault();

    var id_of_task = $(this).data('id');
    // $.post('/tasks', {method: 'delete'}, null, "script");
    var task_row = $(this).parent().parent();

    $.ajax(id_of_task,
        {
          type: 'DELETE',
          url: id_of_task,
          success: function(data) {
            console.log('AJAX transmitted. Here\'s the data');
            console.log(data);

            // need function thats hides the deleted task. The integer we pass in is the amount of time in ms it takes for the
            // element to dissappear
            task_row.hide(1000);
          }
        });

    // console.log('Default Prevented');
    // console.log(id_of_task);
  });

  return link_element;
}

// ***************************************************************** UPDATE ****************************************************************
function bind_update_button_action_to(update_button) {
  // update_button.off();
  update_button.on('click', function(e) {
    e.preventDefault();

    var id_of_task = $(this).data('id');
    var task_row = $('#tasks tr[data-id=' + id_of_task + ']');

    var settings =
    {
      task: {
        name: $('#task_name').val(),
        desc: $('#task_desc').val(),
        duedate: $('#task_duedate').val(),
        priority_id: $('#task_priority_id').val()
      }
    };

    $.ajax(id_of_task,
      {
        type: 'PUT',
        url: '/tasks/'+id_of_task,
        data: settings,
        success: function(data) {

          task_row.children('.name').text(data.task.name);
          task_row.children('.desc').text(data.task.desc);
          task_row.children('.duedate').text(data.task.duedate);
          task_row.children('.urgency-index').text(data.priority.urgency_index);
          task_row.children('.priority_id').text(data.priority.id);
          task_row.css('background-color', data.priority.color);

          add_node(task_row);

          // show create button and hide update button
          $('#edit-submit').addClass('hidden');
          $('#submit').removeClass('hidden');

          $('#new_task input[type=text]').val('');

          // var task = $('<tr>');
          // task.css('background-color', data.priority.color);
          // $('<td>').addClass('name').text(data.task.name).appendTo(task);
          // $('<td>').addClass('desc').text(data.task.desc).appendTo(task);
          // $('<td>').addClass('duedate').text(data.task.duedate).appendTo(task);
          // $('<td>').addClass('urgency-index').text(data.priority.urgency_index).hide().appendTo(task);
          // $('<td>').addClass('priority_id').text(data.priority.id).hide().appendTo(task);

          // OPTIONS 
          // var data_cell_for_options = $('<td>').addClass('options');
          // // var view_button = $('<a>').attr('href', '#').text('View').addClass('small button');
          // var delete_button = $('<a>').attr('href', '#').text('Delete').addClass('small button delete-button');
          // var edit_button = $('<a>').attr('href', '#').text('Edit').addClass('small button edit-button');
          // delete_button.attr('data-id', data.task.id);
          // // data_cell_for_options.append(view_button);
          // data_cell_for_options.append(delete_button);
          // data_cell_for_options.append(edit_button);
          // task.append(data_cell_for_options);
          // bind_delete_button_action_to(delete_button);
      }
    });
  });
}
// ----------------------------------------------------  UP URGENCY  -------------------------------------------------
function move_up_urgency(up_urgency) {
  up_urgency.on('click', function(e){
    e.preventDefault();

    var row = $(this).parent().parent().parent();
    var id = row.attr('data-id');
    // var id = row.children('.id').text().trim();

    $.ajax(
      {
        type: 'PUT',
        url: '/tasks/'+id+'/moveup',
        success: function(data) {
          console.log(data);
      }
    });
  });
}

function move_down_urgency(down_urgency) {
  down_urgency.on('click', function(e) {
    e.preventDefault();
    console.log('move down function!');
  });
}
// //A
// function sort_by_urgency_then_name(a, b){
//   urg_a = $(a).children('.urgency-id').text();
//   name_a = $(a).children('.urgency-id').text();
//   urg_b = $(b).children('.urgency').text();
//   name_b = $(b).children('.name').text();
//   if(col_a > col_b){
//     return 1;
//   } else if (col_a < col_b){
//     return -1;
//   } else {
//     return 0;
//   }
// }

$(function(){

  //When any of the th links is clicked, sorts by the relevant field. I have refactored this to only be a single event handler
  //by grabbing the field title out of the link's id. A little dangerous because if I change my HTML much it breaks my JS
  $('th a').on('click', function(e){
    e.preventDefault();
    //grabs everything but the '_sort' from the link's id and sets the sort_column variable to that prefix for use in sort_by_column
    var sort_id = $(this).attr('id');
    var id_prefix = sort_id.substr(0, sort_id.length - 5);
    sort_column = id_prefix;

    sorted = $('#tasks tbody tr').sort(sort_by_column);
    $('#tasks tbody').empty().append(sorted);
  });

  $('#submit').on('click', function(e){
    //prevents the default behavior of the form, i.e. submitting the form
    //Notice that if this file fails to load or your syntax errors, you will not prevent the default and
    // clicking submit will render a new page with your data on it
    e.preventDefault();

    var settings =
      {
        task: {
          name: $('#task_name').val(),
          desc: $('#task_desc').val(),
          duedate: $('#task_duedate').val(),
          priority_id: $('#task_priority_id').val()
        }
      };

    $.post('/tasks', settings, function(data){
      //Construct an additional row to add to the table, representing one task and its attributes
      var task = $('<tr>').css('background-color', data.priority.color);
      $('<td>').addClass('name').text(data.task.name).appendTo(task);
      $('<td>').addClass('desc').text(data.task.desc).appendTo(task);
      $('<td>').addClass('duedate').text(data.task.duedate).appendTo(task);
      $('<td>').addClass('urgency-index').text(data.priority.urgency_index).hide().appendTo(task);
      $('<td>').addClass('priority_id').text(data.priority.id).hide().appendTo(task);
      // $('#tasks tbody').append(task);
      // we need to add a new td for the options buttons
      var data_cell_for_options = $('<td>').addClass('options');
      // var view_button = $('<a>').attr('href', '#').text('View').addClass('small button');
      var delete_button = $('<a>').attr('href', '#').text('Delete').addClass('small button delete-button');
      var edit_button = $('<a>').attr('href', '#').text('Edit').addClass('small button edit-button');
      // add data_id to our delete button
      delete_button.attr('data-id', data.task.id);
      // appends the view button to the options data cell
      // data_cell_for_options.append(view_button);
      // appends the delete button to the options data cell
      data_cell_for_options.append(delete_button);
      // now put those buttons in!
      data_cell_for_options.append(edit_button);
      task.append(data_cell_for_options);
      // bind the delete functionality to the newly created button
      bind_delete_button_action_to(delete_button);

      add_node(task);
      //Clear form inputs
      $('#new_task input[type=text]').val('');
    });
  });
  // EDITING/UPDATING A TASK
  // $('#edit-submit').on('click', function() {
  //   e.preventDefault();

    // $.ajax(id_of_task,
        // {
        //   type: 'PUT',
        //   url: id_of_task,
        //   success: function(data) {
        //     console.log('AJAX transmitted. Here\'s the data');
        //     console.log(data);

        //     // need function thats hides the deleted task. The integer we pass in is the amount of time in ms it takes for the
        //     // element to dissappear
        //     task_row.hide(1000);
        //   }
        // });
  //   console.log('got the function call');
  // });

  // puts all delete button elements in the variable
  var delete_button_elements = $('.delete-button');
  // passes all delete button elements thru the function 
  bind_delete_button_action_to(delete_button_elements);

  // EDIT
  var edit_button = $('.edit-button');
  bind_edit_button(edit_button);

  // ************************************************************** UPDATE ***********************************************************************
  var update_button = $('#edit-submit');
  bind_update_button_action_to(update_button);

  var up_urgency = $('.up-arrow');
  move_up_urgency(up_urgency);

  var down_urgency = $('.down-arrow');
  move_down_urgency(down_urgency);
});

// create the variable for the update tasks button and assign it to the update button
// that calls a function 
// need the function for bind_update_button_action_to(edit_button)



