import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Container, Input } from 'semantic-ui-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { arrayMove } from 'react-sortable-hoc';
import v4 from 'uuid';

import NavMenu from '../NavMenu';
import SubList from './SubList';

import { sortByPriority, sortByDate } from '../../sort';
import { getOutdatedTasks, getTodayTasks, getTomorrowTasks, getWeekTasks, getOtherTasks } from '../../dateTime';
import config from '../../config';

class List extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: props.list ? props.list.id : undefined,
			showAddTaskPanel: false,
			text: '',
			endDate: new Date(),
			priority: 0
		};
		this.subLists = [];
		for (let i = 0; i < config.SublistsTitles.length; i++) {
			this.subLists[i] = {
				title: config.SublistsTitles[i],
				tasks: []
			};
		}
		props.changeList(this.state.id);
	}

	onSortEnd = ({ oldIndex, newIndex, collection }) => {
		this.subLists[collection].tasks = arrayMove(this.subLists[collection].tasks, oldIndex, newIndex);
		let tasks = this.concatSublistsTasks();
		this.props.changeTasks(tasks);
	};
	onSortStart = ({ oldIndex, newIndex, collection }, e) => {
		e.preventDefault();
	};
	concatSublistsTasks = () => {
		let tasks = [];
		for (let i = 0; i < this.subLists.length; i++) tasks = tasks.concat(this.subLists[i].tasks);
		return tasks;
	};
	sortAndChangeTasks = (collection, sortType, isAscOrder) => {
		let subListTasks = this.subLists[collection].tasks;
		switch (sortType) {
			case 'priority':
				subListTasks = sortByPriority(subListTasks, isAscOrder);
				break;
			case 'date':
				subListTasks = sortByDate(subListTasks, isAscOrder);
				break;
		}
		this.subLists[collection].tasks = subListTasks;
		let tasks = this.concatSublistsTasks();
		this.props.changeTasks(tasks);
	};
	checkAndChangeTasks = (collection, isCheck) => {
		let subListTasks = this.subLists[collection].tasks;
		subListTasks = [ ...subListTasks ].map(
			(task) => (task.isChecked === isCheck ? { ...task } : { ...task, isChecked: isCheck })
		);
		this.subLists[collection].tasks = subListTasks;
		let tasks = this.concatSublistsTasks();
		this.props.changeTasks(tasks);
	};
	deleteAndChangeTasks = (collection) => {
		let subListTasks = this.subLists[collection].tasks;
		subListTasks = [ ...subListTasks ].reduce(
			(arr, task) => (!task.isChecked ? [ ...arr, { ...task } ] : [ ...arr ]),
			[]
		);
		this.subLists[collection].tasks = subListTasks;
		let tasks = this.concatSublistsTasks();
		this.props.changeTasks(tasks);
	};
	toggleAddTaskPanel = () => {
		this.setState({
			showAddTaskPanel: !this.state.showAddTaskPanel
		});
	};
	saveToStorage() {
		let obj = JSON.stringify({
			idOfCurrentList: null,
			lists: this.props.lists
		});
		localStorage.setItem('my_todoList', obj);
	}
	componentDidUpdate() {
		this.saveToStorage();
	}
	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.idOfCurrentList !== nextProps.idOfCurrentList) return false;
		return true;
	}
	componentDidMount() {
		let node = document.getElementById(this.state.id);
		if (this.state.id) {
			setTimeout(() => {
				node.style.opacity = '1';
			}, config.ANIMATION_DELAY);
		}
	}
	onAddTask = (e) => {
		e.preventDefault();
		let edate = new Date(this.state.endDate);
		edate.setHours(0, 0, 0, 0);
		let sdate = new Date(Date.now());
		this.props.addTask({
			id: v4(),
			caption: this.state.text.trim(),
			startDate: sdate,
			endDate: edate,
			isChecked: false,
			priority: this.state.priority ? this.state.priority : 0
		});
		this.setState({
			text: '',
			endDate: sdate,
			priority: 0
		});
	};
	handleChanges = (e, { name, value }) => {
		this.setState({ [name]: value });
	};
	handleChange = (e, { name, value }) => {
		this.props.editList(value);
	};
	changeRating = (e, { rating }) => {
		this.setState({ priority: rating });
	};
	render() {
		let { deleteAllCheckedTasks, checkTask, deleteTask } = this.props;
		let list = this.props.list;
		if (!list) return <Redirect to="../*" />;
		let tasks = list.tasks;

		this.subLists[0].tasks = getTodayTasks(tasks);
		this.subLists[1].tasks = getTomorrowTasks(tasks);
		this.subLists[2].tasks = getWeekTasks(tasks);
		this.subLists[3].tasks = getOtherTasks(tasks);
		this.subLists[4].tasks = getOutdatedTasks(tasks);
		return (
			<div className="list" id={list.id}>
				<NavMenu
					handleChanges={this.handleChanges}
					onAddTask={this.onAddTask}
					endDate={this.state.endDate}
					priority={this.state.priority}
					text={this.state.text}
					changeRating={this.changeRating}
					deleteAllCheckedTasks={deleteAllCheckedTasks}
					toggleSortAsc={this.toggleSortAsc}
				/>
				<Container as="header" textAlign="center">
					<Input className="list__title" onChange={this.handleChange} value={list.title} />
				</Container>
				{/* <Container>
          {(this.state.showAddTaskPanel) ?
          <Button icon='unhide' content='Add task panel' onClick={this.toggleAddTaskPanel}/>
          :
          <Button icon='hide' content='Add task panel' onClick={this.toggleAddTaskPanel}/>
          }
          <Collapse isOpen={this.state.showAddTaskPanel}>
            <AddTaskForm handleChanges={this.handleChanges} onAddTask={this.onAddTask}
            endDate={this.state.endDate}
            priority={this.state.priority}
            text={this.state.text}
            changeRating={this.changeRating}/>
          </Collapse>
        </Container> */}

				<section className="sublists-grid">
					<TransitionGroup component={null}>
						{this.subLists.map(
							(sublist, index) =>
								sublist.tasks.length > 0 ? (
									<CSSTransition key={index + 1} timeout={500} unmountOnExit classNames="fade">
										<SubList
											index={index}
											subList={sublist}
											onSortEnd={this.onSortEnd}
											onSortStart={this.onSortStart}
											checkTask={checkTask}
											deleteTask={deleteTask}
											sortAndChangeTasks={this.sortAndChangeTasks}
											checkAndChangeTasks={this.checkAndChangeTasks}
											deleteAndChangeTasks={this.deleteAndChangeTasks}
										/>
									</CSSTransition>
								) : (
									''
								)
						)}
					</TransitionGroup>
				</section>
			</div>
		);
	}
}
export default List;
