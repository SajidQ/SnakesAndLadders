$(document).ready(function(){
  ////////////////////////////////////////////
  //Game Variables ///////////////////////////
  var blue_piece_object =
  {
    top: null,
    left:null,
    width:null
  }

  var red_piece_object =
  {
    top: null,
    left:null,
    width:null
  }

  var snakes=[{start:'id_98',end:80}, {start:'id_82', end:28}, {start:'id_17', end:12}, {start:'id_77', end:47}];
  var ladders=[{start:'id_7',end:30}, {start:'id_50', end:69}, {start:'id_32', end:87}, {start:'id_74', end:93}, {start:'id_41', end:51}];

  //object used to store all of the important variables; often passed between functions
  var main_vars=[];
  main_vars["game_started"]=0;
  main_vars["whos_turn"]=1; //1=player's turn, 0=computer's turn
  main_vars["blue_turn_text"]="It's your turn. Click to roll the dice!";
  main_vars["computer_turn_text"]="It's the computer's turn";
  main_vars["computer_location"]=-1;
  main_vars["blue_location"]=-1;
  main_vars["dice_results"]=0; //saves the results of the
  main_vars["allow_move"]=0; //controls when the player can move his piece
  main_vars["dice_rolled"]=0;



  //Setup the checkered board
  make_background();



  ///////////////////////////////////////////////////
  // Mouse effects ///////////////////////////////
  var $blue_piece = null;

  //user moving the mouse
  $(document.body).on("mousemove", function(e) {
    $("#in_function").html("mousemove");

    if ($blue_piece) {
      $blue_piece.offset({
        top: e.pageY,
        left: e.pageX
      });
    }

    if($blue_piece!==null)
    {
      blue_piece_object.left=($blue_piece.offset().left-$("#checkers").offset().left);
      blue_piece_object.top=($blue_piece.offset().top-$("#checkers").offset().top);

      $("#position").html("X: "+($blue_piece.offset().left-$("#checkers").offset().left)+" , Y:"+($blue_piece.offset().top-$("#checkers").offset().top)+ ", L:"+main_vars["blue_location"]);
    }

  });

  //user clicking on the blue-piece
  $(document.body).on("mousedown", "#blue-piece", function (e) {

    $("#in_function").html("mousedown");


    if(main_vars["allow_move"]==1)
    {

      $blue_piece = $(e.target);

      update_blue_location($blue_piece, blue_piece_object);

      //debugging print out position of the blue piece
      $("#position").html("X:"+($blue_piece.offset().left-$("#checkers").offset().left)+" , Y:"+($blue_piece.offset().top-$("#checkers").offset().top)+ ", L:"+main_vars["blue_location"]);


    }
    else
    $("#in_function").html("mousedown: Not your turn.");



  });

  //user letting go of blue-piece
  $(document.body).on("mouseup", function (e) {
    $("#in_function").html("mouseup");


    if(main_vars["allow_move"]==1)
    {
      //update the location of the blue-piece
      update_blue_location($blue_piece, blue_piece_object);

      //find the blue-piece and determine if it's on a snake/ladder
      var on_box=find_box(blue_piece_object);

      var found_ladder=-1;
      if(on_box==("id_"+main_vars["blue_location"]))
      {
        $blue_piece = null;
        found_ladder=check_for_ladders_snakes(on_box,blue_piece_object, ladders,snakes,main_vars, "#blue-piece", "blue_location");
      }
      else
      alert("Move to your correct spot: " + "id_"+main_vars["blue_location"]);

      //if there was a snake or ladder; update the variables
      if(found_ladder!==-1)
      {
        //update_blue_location($blue_piece, blue_piece_object);
        //on_box=find_box(blue_piece_object);
        var temp="id_"+found_ladder;
        found_ladder=temp;
      }
      else
      found_ladder=on_box;

      //check if user has placed the blue-piece in it's correct location;
      //if so; transfer the turn to the computer
      if(found_ladder==("id_"+main_vars["blue_location"]))
      {
        $blue_piece = null;

        //debugging comment
        $("#on_box").html("Box: "+on_box+ " on location!");

        var winner=found_winner(main_vars);

        //transfer turn if winner has not been found or user rolled a 6
        if(winner==0 && main_vars["dice_results"]!==6)
        {
          //change variables to show it's the computer's turn;
          main_vars["allow_move"]=0;
          main_vars["whos_turn"]=0;
          $("#turn").html("It's the computer's turn.");

          //call computers_turn to start the computer's turn
          computers_turn(main_vars, red_piece_object, ladders, snakes);
        }
        //if the player rolled a 6
        else if(winner==0 && main_vars["dice_results"]==6)
        {
          main_vars["dice_rolled"]=0;
          $("#turn").html("You got a 6! You get to roll again!");
        }

      }
      //else
      // alert("Move to your correct spot: "+found_ladder);
    }
    else
    $blue_piece = null;

    //debugging: display position of the blue-piece
    $("#position").html("X:"+(blue_piece_object.left)+" , Y:"+(blue_piece_object.top)+ ", L:"+main_vars["blue_location"]);

  });

  //click event for the dice; utilized only by user when it's his turn
  $(document.body).on("click", "#dice_img", function (e)
  {
    $("#in_function").html("dice_click");

    if(main_vars["whos_turn"]==1 && main_vars["dice_rolled"]==0)
    {
      dice_roll(main_vars);
      main_vars["dice_rolled"]=1;
    }

  });

});


function make_background()
{
  //variables
  var colors = ['be5553', 'bad6a5', 'e8b13b', '80CDC0', 'f2edbd'];
  var colors_above = ['0','0','0','0','0','0','0','0','0','0'];
  var colors_used=[0,0,0,0,0];
  var color_num=0;


  //loop thorough all the boxes
  var $newdiv;

  //iterate to create boxes for the checker board
  for (var i = 0; i < 100; i++)
  {
    //create a box class div and attach it to the checkers board
    $newdiv = $('<div class="box" id="id_'+(Math.abs(99-i)+1)+'" />').text(Math.abs(99-i)+1);
    $('#checkers').append($newdiv);

    //assign a color
    $('#id_'+(Math.abs(99-i)+1)).css('background-color',"#"+colors[color_num]);

    //update color_num; mod if over 5
    color_num++;
    if(color_num>4)
    color_num=color_num%5;

    //if finished with one row; move the colors left by 2
    if((i+1)%10==0)
    {
      var first_col=colors[0];
      var second_col=colors[1];

      for(var j=0; j<3; j++)
      {
        colors[j]=colors[(j+2)];
      }

      colors[3]=first_col;
      colors[4]=second_col;
    }
  }
}


//func: used to find the box the player is on
function find_box(blue_piece_object)
{
  $("#in_function").html("find_box");
  var return_val=null;
  var extra_space=4;

  //iterate through all the div boxes
  $("div.box").each(function(index,value)
  {
    //variables
    var boxL=value.offsetLeft;
    var boxT=value.offsetTop;//-$("#checkers").offset().top;
    var boxWidth=value.offsetWidth;
    var pieceL=blue_piece_object.left;
    var pieceT=blue_piece_object.top;

    //compare if the left and top positions of the blue-pieve are within one of the boxes
    if(pieceL>(boxL-extra_space) && (pieceL+blue_piece_object.width)<=(boxL+boxWidth+extra_space))
    {
      if((boxT-extra_space)<pieceT && (boxT+boxWidth+extra_space)>=(pieceT+blue_piece_object.width))
      {
        //alert(value.id+": Collision");

        return_val=value.id;
        $("#on_box").html("Box: "+return_val);
      }
    }
  });

  //if(return_val==null)
  //  alert("Move to your correct spot!");

  return return_val;
}


//func: check if the blue/computer piece has landed on a snake or ladder then moves it
function check_for_ladders_snakes(on_box,piece_object, ladders, snakes, main_vars, piece_text, update_text)
{
  $("#in_function").html("check_for_ladders_snakes");

  var the_end_location=-1;

  //look for snakes
  for(var i=0;i<snakes.length; i++)
  {
    if(on_box==snakes[i].start)
    {

      $("#snake_ladder").html("Boo! Found a snake!");
      the_end_location=snakes[i].end;
    }
  }


  //look for ladders
  for(var i=0;i<ladders.length; i++)
  {
    if(on_box==ladders[i].start)
    {
      $("#snake_ladder").html("Woo-hoo! Found a ladder!");

      the_end_location=ladders[i].end;
    }
  }

  //if the blue/computer pieve is on a ladder than move it to the right location
  if(the_end_location!==-1)
  {
    var piece_top=piece_object.top;
    var piece_left=piece_object.left;
    var box_top=$("#id_"+the_end_location).offset().top-$("#checkers").offset().top;
    var box_left=$("#id_"+the_end_location).offset().left-$("#checkers").offset().left;

    var differce_left=box_left-piece_left;
    var differce_top=box_top-piece_top;

    $(piece_text).animate({
      left:'+='+differce_left+'px',
      top:'+='+differce_top+'px'
    }, "slow");

    main_vars[update_text]=the_end_location;
  }

  return the_end_location;
}




//func: this animates the dice roll;
//calls reaction-functions for blue/computer piece after results
function dice_roll(main_vars, red_piece_object, ladders, snakes)
{
  $("#in_function").html("dice_roll");
  $("#snake_ladder").html("");

  j=Math.floor(Math.random()*6)+1;
  var time_out;
  var start=new Date().getTime();
  var intv=window.setInterval(function(){
    $('#dice_img').attr('src','images/side'+j+'.png');

    main_vars["dice_results"]=j;

    //get time
    var curr=new Date().getTime();
    if((curr-start)>10000)
    {
      window.clearInterval(intv);

      if(main_vars["whos_turn"]==1)
      blue_pieces_turn(main_vars);
      else if(main_vars["whos_turn"]==0)
      move_computer(main_vars, red_piece_object, ladders, snakes);

    }

    j++; //increment data array id
    j=Math.floor(Math.random()*6)+1; //repeat from start

  },500);

}


//func: updates the variables for the blue piece
function blue_pieces_turn(main_vars)
{
  //update turn sign
  $("#turn").html("Move your piece "+main_vars["dice_results"]+" spots.");

  //check if the dice results are larger than need to finish the game
  if(main_vars["dice_results"]>=(100-main_vars["blue_location"]))
  {
    main_vars["dice_results"]=(100-main_vars["blue_location"]);
  }

  //change location of blue_object if it was -1
  if(main_vars["blue_location"]==-1)
  main_vars["blue_location"]=0;

  //update the new blue location using dice roll
  main_vars["blue_location"]=main_vars["blue_location"]+main_vars["dice_results"];

  //allow the player to move the blue-piece physically
  main_vars["allow_move"]=1;

  //comments for debugging
  $("#in_function").html("blue_pieces_turn: "+main_vars["blue_location"]+" "+main_vars["allow_move"]);
}


//func: rolls the dice for the computer
function computers_turn(main_vars, red_piece_object, ladders, snakes)
{
  $("#in_function").html("computers_turn");

  dice_roll(main_vars, red_piece_object, ladders, snakes);
}


//func: moved the computer; called by dice_roll
function move_computer(main_vars, red_piece_object, ladders, snakes)
{

  $("#in_function").html("move_computer");

  //slide down
  var end_location=-1;

  if(main_vars["computer_location"]==-1)
  main_vars["computer_location"]=0;

  main_vars["computer_location"]=main_vars["computer_location"]+main_vars["dice_results"];
  end_location=main_vars["computer_location"];

  if(main_vars["dice_results"]>=(100-main_vars["computer_location"]))
  {
    end_location=100;
    main_vars["computer_location"]=100;
  }

  $("#in_function").html("move_computer");
  $("#computer").html("computer: "+end_location);


  red_piece_object.left=($("#red-piece").offset().left-$("#checkers").offset().left);
  red_piece_object.top=($("#red-piece").offset().top-$("#checkers").offset().top);
  red_piece_object.width=$("#red-piece").width();
  $("#computer").html("computer: "+" X:"+red_piece_object.left+" Y:"+red_piece_object.top);
  var found_ladder=-1;
  found_ladder=check_for_ladders_snakes(("id_"+end_location),red_piece_object, ladders, snakes, main_vars, "#red-piece", "computer_location");

  if(found_ladder==-1)
  {
    var blue_top=($("#red-piece").offset().top-$("#checkers").offset().top);
    var blue_left=($("#red-piece").offset().left-$("#checkers").offset().left);
    var new_loc_top=$("#id_"+end_location).offset().top-$("#checkers").offset().top;
    var new_loc_left=$("#id_"+end_location).offset().left-$("#checkers").offset().left;

    var differce_left=new_loc_left-blue_left;
    var differce_top=new_loc_top-blue_top;
    //alert("id_"+end_location+": "+blue_top+" "+blue_left+" "+new_loc_top+" "+new_loc_left);
    //alert("id_"+end_location+": "+differce_top+" "+differce_left);

    $("#red-piece").animate({
      left:'+='+differce_left+'px',
      top:'+='+differce_top+'px'
    },"slow");
  }

  var winner=found_winner(main_vars);

  $("#turn").html("Computer moved to "+end_location+". "+main_vars["blue_turn_text"]);

  if(main_vars["dice_results"]!==6 && winner==0)
  {
    main_vars["whos_turn"]=1;
    main_vars["dice_rolled"]=0;

  }
  else if(main_vars["dice_results"]==6)
  {
    $("#turn").html("Computer rolled a 6! It gets to roll again!");
    dice_roll(main_vars, red_piece_object, ladders, snakes);
  }
}


function update_blue_location($blue_piece, blue_piece_object)
{
  blue_piece_object.left=($blue_piece.offset().left-$("#checkers").offset().left);
  blue_piece_object.top=($blue_piece.offset().top-$("#checkers").offset().top);
  blue_piece_object.width=$blue_piece.width();
}

function found_winner(main_vars)
{
  $("#in_function").html("found_winner");
  $("#computer").html("computer: "+main_vars["computer_location"]);

  var found=0;
  if(main_vars["blue_location"]==100)
  {
    alert("The winner is the blue player!");
    main_vars["whos_turn"]=-1;
    main_vars["allow_move"]=-1;
    found=1;
  }

  else if(main_vars["computer_location"]==100)
  {
    alert("The winner is the computer!");
    main_vars["whos_turn"]=-1;
    main_vars["allow_move"]=-1;
    found=1;
  }

  return found;
}
