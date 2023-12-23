import {
	Grid,
	Box,
	Typography,
	Paper,
	Divider,
	TextField,
	Select,
	MenuItem,
	Switch,
	Checkbox,
	Button,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import {
	TCategoryId,
	CategoryIds,
	TEventTypeId,
	EventTypeIds,
	TEventStatusId,
	EventStatusIds,
	EventTypeIdToString,
	CategoryIdToString,
	EventStatusIdToString,
} from '../../../Hooks/Event/eventTypes';

import './EventEdit.css';

import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { TnewEventModify } from 'Hooks/Event/useEventEdit';

export default function EventEdit({
	newEvent,
	setNewEvent,
}: {
	newEvent: TnewEventModify;
	setNewEvent: React.Dispatch<React.SetStateAction<TnewEventModify>>;
}) {
	function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
		setNewEvent((prev) => {
			if (!prev) return prev;
			return { ...prev, [e.target.name]: e.target.value };
		});
	}

	const [selectedIconUrl, setSelectedIconUrl] = useState<string>('');

	useEffect(() => {
		if (!newEvent.icon) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			setSelectedIconUrl(reader.result as string);
		};
		reader.onerror = (e) => {
			console.error(e);
		}
		reader.readAsDataURL(newEvent.icon);

	}, [newEvent.icon]);

	return (
		<Box
			className='event-edit-container'
			component={Paper}
			elevation={1}
			borderRadius={0}
		>
			<Grid
				container
				spacing={2}
				justifyContent='center'
				alignItems='center'
				className='event-edit-grid'
			>
				<Grid item xs={12}>
					<Typography variant='h5'>Event Basic Details</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{newEvent.id}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Name</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent?.name}
						name='name'
						onChange={handleTextChange}
						fullWidth
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Icon</Typography>
				</Grid>
				<Grid
					item
					xs={6}
					container
					justifyContent='center'
					alignItems='center'
				>
					<Grid item xs={6}>
						{newEvent?.icon ? (
							<img
								src={selectedIconUrl}
								referrerPolicy='no-referrer'
								style={{
									maxWidth: '70px',
									maxHeight: '70px',
									objectFit: 'contain',
								}}
								alt='Event Logo'
							/>
						) : (
							<Typography>No Icon Uploaded</Typography>
						)}
					</Grid>
					<Grid item xs={6}>
						<input
							accept='image/*'
							type='file'
							style={{ display: 'none' }}
							id='icon-upload'
							onChange={(e) => {
								if (e.target.files) {
									setNewEvent((prev) => {
										if (!prev) return prev;
										if (!e.target.files) return prev;

										if(e.target.files.length === 0) return prev;

										return {
											...prev,
											icon: e.target.files[0],
										};
									});
								}
							}}
						/>
						<label htmlFor='icon-upload'>
							<Button
								variant='contained'
								component='span'
								startIcon={<CloudUploadIcon />}
								size='small'
							>
								Choose Icon
							</Button>
						</label>
					</Grid>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Type</Typography>
				</Grid>
				<Grid item xs={6}>
					<Select
						value={newEvent.eventTypeId}
						fullWidth
						name='eventTypeId'
						onChange={(e) => {
							setNewEvent((prev) => {
								if (!prev) return prev;
								return {
									...prev,
									eventTypeId: e.target.value as TEventTypeId,
								};
							});
						}}
					>
						{EventTypeIds.map((id) => {
							return (
								<MenuItem value={id} key={id}>
									{EventTypeIdToString[id]}
								</MenuItem>
							);
						})}
					</Select>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Category</Typography>
				</Grid>
				<Grid item xs={6}>
					<Select
						value={newEvent.categoryId}
						fullWidth
						name='categoryId'
						onChange={(e) => {
							setNewEvent((prev) => {
								if (!prev) return prev;
								return {
									...prev,
									categoryId: e.target.value as TCategoryId,
								};
							});
						}}
					>
						{CategoryIds.map((id) => {
							return (
								<MenuItem value={id} key={id}>
									{CategoryIdToString[id]}
								</MenuItem>
							);
						})}
					</Select>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Venue</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.venue}
						name='venue'
						onChange={handleTextChange}
						fullWidth
					/>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>
						Event Registration Details
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Needs Registration?</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						<Checkbox
							checked={newEvent.needRegistration}
							onChange={(e) => {
								setNewEvent((prev) => {
									if (!prev) return prev;
									return {
										...prev,
										needRegistration: e.target.checked,
									};
								});
							}}
						/>
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Is Team?</Typography>
				</Grid>
				<Grid item xs={6}>
					<Checkbox
						checked={newEvent.isTeam}
						onChange={(e) => {
							setNewEvent((prev) => {
								if (!prev) return prev;
								return {
									...prev,
									isTeam: e.target.checked,
								};
							});
						}}
					/>
				</Grid>

				{newEvent?.isTeam && (
					<>
						<Grid item xs={6}>
							<Typography>Team Size</Typography>
						</Grid>
						<Grid item xs={6}>
							<TextField
								value={newEvent.teamSize}
								name='teamSize'
								onChange={handleTextChange}
								type='number'
								fullWidth
							/>
						</Grid>
					</>
				)}

				<Grid item xs={6}>
					<Typography>Register Button Text</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.button}
						name='button'
						onChange={handleTextChange}
						fullWidth
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Registration Link</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.registrationLink}
						name='registrationLink'
						onChange={handleTextChange}
						fullWidth
					/>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Event Timeline Details</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Day</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.day}
						name='day'
						onChange={handleTextChange}
						type='number'
						fullWidth
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event DateTime</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						<DateTimePicker
							value={dayjs(newEvent.datetime)}
							sx={{
								width: '100%',
							}}
							onChange={(e) => {
								setNewEvent((prev) => {
									if (!prev) return prev;

									if (!e) {
										return {
											...prev,
											datetime: new Date(),
										};
									}

									return {
										...prev,
										datetime: new Date(e.toString()),
									};
								});
							}}
						/>
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Event Status</Typography>
				</Grid>
				<Grid item xs={6}>
					<Select
						value={newEvent.eventStatusId}
						fullWidth
						name='eventStatusId'
						onChange={(e) => {
							setNewEvent((prev) => {
								if (!prev) return prev;
								return {
									...prev,
									eventStatusId: e.target
										.value as TEventStatusId,
								};
							});
						}}
					>
						{EventStatusIds.map((id) => {
							return (
								<MenuItem value={id} key={id}>
									{EventStatusIdToString[id]}
								</MenuItem>
							);
						})}
					</Select>
				</Grid>

				<Grid item xs={6}>
					<Typography>Number of Rounds</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.numberOfRounds}
						name='numberOfRounds'
						onChange={handleTextChange}
						type='number'
						fullWidth
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Current Round</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.currentRound}
						name='currentRound'
						onChange={handleTextChange}
						type='number'
						fullWidth
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Registrations Open?</Typography>
				</Grid>
				<Grid item xs={6}>
					<Switch
						checked={newEvent.registrationOpen}
						onChange={(e) => {
							setNewEvent((prev) => {
								if (!prev) return prev;
								return {
									...prev,
									registrationOpen: e.target.checked,
								};
							});
						}}
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Registrations End DateTime</Typography>
				</Grid>
				<Grid item xs={6}>
					<DateTimePicker
						value={dayjs(newEvent.registrationEndDate)}
						sx={{
							width: '100%',
						}}
						onChange={(e) => {
							setNewEvent((prev) => {
								if (!prev) return prev;

								if (!e) {
									return {
										...prev,
										registrationEndDate: new Date(),
									};
								}

								return {
									...prev,
									registrationEndDate: new Date(e.toString()),
								};
							});
						}}
					/>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Event Prize and Fee</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Entry Fee</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.entryFee}
						name='entryFee'
						onChange={handleTextChange}
						type='number'
						fullWidth
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Prize Money</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.prizeMoney}
						name='prizeMoney'
						onChange={handleTextChange}
						type='number'
						fullWidth
					/>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Event Heads Details</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Head 1</Typography>
				</Grid>
				<Grid item xs={6}>
					{/* <Autocomplete
						sx={{ width: '100%' }}
						options={choosableCaList}
						autoHighlight
						getOptionLabel={(option) => option.name}
						onChange={(event, newValue) => {
							if (newValue) {
								setChosenAmbassadorId(newValue.ambassadorId);
							}
						}}
						disabled={savingAmbassador}
						value={choosableCaList.find((CA) => {
							return CA.ambassadorId === chosenAmbassadorId;
						})}
						renderOption={(props, ca) => (
							<Box component='li' {...props}>
								<StyledTableCell
									sx={{
										width: '50%',
										overflow: 'hidden',
									}}
								>
									{ca.name}
								</StyledTableCell>
								<StyledTableCell
									sx={{
										width: '50%',
										overflow: 'hidden',
									}}
								>
									{ca.email}
								</StyledTableCell>
							</Box>
						)}
						renderInput={(params) => (
							<TextField
								{...params}
								label='Choose a Ambassador'
								inputProps={{
									...params.inputProps,
									autoComplete: 'new-password', // disable autocomplete and autofill
								}}
							/>
						)}
					/> */}
					{/* <Typography>{newEvent?.eventHead1?.name}</Typography>
					<Typography>{newEvent?.eventHead1?.phoneNumber}</Typography>
					<Typography>{newEvent?.eventHead1?.email}</Typography> */}
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Head 2</Typography>
				</Grid>
				<Grid item xs={6}>
					{/* <Typography>{newEvent?.eventHead2?.name}</Typography>
					<Typography>{newEvent?.eventHead2?.phoneNumber}</Typography>
					<Typography>{newEvent?.eventHead2?.email}</Typography> */}
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>
						Event Information Details
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>About</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.about}
						name='about'
						onChange={handleTextChange}
						multiline
						
						sx={{
							width: '100%',
						}}
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Format</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.format}
						name='format'
						onChange={handleTextChange}
						multiline

						sx={{
							width: '100%',
						}}
					/>
				</Grid>

				<Grid item xs={6}>
					<Typography>Rules</Typography>
				</Grid>
				<Grid item xs={6}>
					<TextField
						value={newEvent.rules}
						name='rules'
						onChange={handleTextChange}
						multiline

						sx={{
							width: '100%',
						}}
					/>
				</Grid>
			</Grid>
		</Box>
	);
}
