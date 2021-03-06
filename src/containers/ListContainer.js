import { connect } from 'react-redux';
import List from '../components/List/List';
import {
	onDeleteTask,
	onCheckTask,
	onChangeTasksArray,
	onChangeList,
	onDeleteAllCheckedTasks,
	onAddTask,
	onEditList
} from '../actions/';

const mapStateToProps = (state, ownProps) => ({
	lists: state.lists.lists,
	idOfCurrentList: state.lists.idOfCurrentList,
	list: state.lists.lists.find((list) => list.id === ownProps.match.params.id)
});

const mapDispatchToProps = (dispatch) => ({
	changeList: (newListId) => {
		dispatch(onChangeList(newListId));
	},
	deleteAllCheckedTasks: () => {
		dispatch(onDeleteAllCheckedTasks());
	},
	addTask: (taskData) => {
		dispatch(onAddTask(taskData));
	},
	editList: (title) => {
		dispatch(onEditList(title));
	},
	changeTasks: (tasks) => {
		dispatch(onChangeTasksArray(tasks));
	},
	checkTask: (id) => {
		dispatch(onCheckTask(id));
	},
	deleteTask: (id) => {
		dispatch(onDeleteTask(id));
	}
});
export default connect(mapStateToProps, mapDispatchToProps)(List);
